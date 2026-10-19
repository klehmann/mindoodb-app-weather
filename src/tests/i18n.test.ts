import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  APP_LOCALES,
  detectLocale,
  matchLocale,
  messages,
  toBcp47,
  toGeocodingLanguage,
} from "@/i18n";
import { formatPercent, formatVisibility } from "@/domain/formatting";
import { GeocodingError, resolveLocation } from "@/services/geocoding";

type Tree = { [key: string]: string | Tree };

function flatten(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out.set(path, value);
    } else {
      for (const [k, v] of flatten(value, path)) {
        out.set(k, v);
      }
    }
  }
  return out;
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort();
}

const english = flatten(messages.en as Tree);

describe("locale parity", () => {
  it("offers every language Haven offers", () => {
    expect([...APP_LOCALES].sort()).toEqual(["de", "en", "es", "fr", "it", "nb", "nl", "pl"]);
    expect(Object.keys(messages).sort()).toEqual([...APP_LOCALES].sort());
  });

  for (const locale of APP_LOCALES) {
    describe(locale, () => {
      const table = flatten(messages[locale] as Tree);

      it("has exactly the English keys", () => {
        expect([...table.keys()].sort()).toEqual([...english.keys()].sort());
      });

      it("has no empty texts", () => {
        const empty = [...table].filter(([, text]) => !text.trim()).map(([key]) => key);
        expect(empty).toEqual([]);
      });

      it("keeps the English {placeholders}", () => {
        const mismatched = [...english]
          .filter(([key, text]) => placeholders(table.get(key) ?? "").join() !== placeholders(text).join())
          .map(([key]) => key);
        expect(mismatched).toEqual([]);
      });
    });
  }

  it("uses a no-break space before French : ; ? ! and inside « »", () => {
    const bad = [...flatten(messages.fr as Tree)]
      .filter(([, text]) => / [:;?!»]|« /.test(text))
      .map(([key]) => key);
    expect(bad).toEqual([]);
  });

  it("has the boot-failure text of index.html in every language", () => {
    const html = readFileSync(resolve(process.cwd(), "index.html"), "utf8");
    const block = /var BOOT_FAILED = \{([\s\S]*?)\};/.exec(html)?.[1] ?? "";
    const keys = [...block.matchAll(/^\s*(\w+):\s*"[^"]+"/gm)].map((m) => m[1]).sort();
    expect(keys).toEqual([...APP_LOCALES].sort());
  });
});

describe("locale selection", () => {
  it("maps tags by their primary subtag", () => {
    expect(matchLocale("de-AT")).toBe("de");
    expect(matchLocale("fr-CA")).toBe("fr");
    expect(matchLocale("pl")).toBe("pl");
    expect(matchLocale("nb-NO")).toBe("nb");
    expect(matchLocale("no")).toBe("nb");
    expect(matchLocale("nn-NO")).toBe("nb");
    expect(matchLocale("pt-BR")).toBeNull();
    expect(matchLocale("")).toBeNull();
  });

  it("falls back to English for languages Haven does not offer", () => {
    expect(detectLocale({ explicit: "pt-BR" })).toBe("en");
    expect(detectLocale({ explicit: "it-CH" })).toBe("it");
  });

  it("formats with a regional tag and asks the geocoder for Norwegian as `no`", () => {
    expect(toBcp47("nb")).toBe("nb-NO");
    expect(toBcp47("pl")).toBe("pl-PL");
    expect(toGeocodingLanguage("nb")).toBe("no");
    expect(toGeocodingLanguage("fr")).toBe("fr");
  });

  it("formats numbers in the active locale", () => {
    expect(formatVisibility(12_300, "metric", "fr-FR")).toBe("12,3 km");
    expect(formatVisibility(12_300, "metric", "en-US")).toBe("12.3 km");
    expect(formatPercent(45, "en-US")).toBe("45%");
    expect(formatPercent(45, "de-DE")).toBe("45 %");
  });
});

describe("geocoding language", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  function stubFetch(name: string) {
    return vi.fn(async (_url: string) =>
      new Response(
        JSON.stringify({ results: [{ name, latitude: 48.137, longitude: 11.575, country: "x", timezone: "Europe/Berlin" }] }),
        { status: 200 },
      ),
    );
  }

  it("asks for localized names and caches them per language", async () => {
    const pl = stubFetch("Monachium");
    const plResult = await resolveLocation("Munich", "pl", pl as unknown as typeof fetch);
    expect(plResult.displayName).toBe("Monachium");
    expect(new URL(pl.mock.calls[0]![0]).searchParams.get("language")).toBe("pl");

    const nb = stubFetch("München");
    const nbResult = await resolveLocation("Munich", "nb", nb as unknown as typeof fetch);
    expect(nbResult.displayName).toBe("München");
    expect(new URL(nb.mock.calls[0]![0]).searchParams.get("language")).toBe("no");

    const cached = stubFetch("unused");
    expect((await resolveLocation("Munich", "pl", cached as unknown as typeof fetch)).displayName).toBe("Monachium");
    expect(cached).not.toHaveBeenCalled();
  });

  it("finds a query written in another language and localizes it by id", async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (raw: string) => {
      const url = new URL(raw);
      const language = url.searchParams.get("language");
      calls.push(`${url.pathname} ${language}`);
      if (url.pathname.endsWith("/get")) {
        return new Response(JSON.stringify({ id: 2950159, name: "Berlin", country: "Allemagne", latitude: 52.5, longitude: 13.4 }));
      }
      const hit = language === "de" ? [{ id: 2950159, name: "Berlin", country: "Deutschland", latitude: 52.5, longitude: 13.4 }] : undefined;
      return new Response(JSON.stringify({ results: hit }));
    });
    const result = await resolveLocation("Berlin, Deutschland", "fr", fetchImpl as unknown as typeof fetch);
    expect(result.country).toBe("Allemagne");
    expect(calls).toEqual(["/v1/search fr", "/v1/search en", "/v1/search de", "/v1/get fr"]);
  });

  it("reports a missing place as a typed error", async () => {
    const empty = vi.fn(async () => new Response(JSON.stringify({}), { status: 200 }));
    await expect(resolveLocation("Nowhere", "fr", empty as unknown as typeof fetch)).rejects.toMatchObject({
      kind: "notFound",
    });
    await expect(resolveLocation("Nowhere2", "fr", empty as unknown as typeof fetch)).rejects.toBeInstanceOf(
      GeocodingError,
    );
  });
});

describe("haven-app.json", () => {
  /** The texts below every "fr" key: the localized store listing Haven shows. */
  function french(value: unknown, path = "", out: [string, string][] = []): [string, string][] {
    if (value && typeof value === "object") {
      for (const [key, child] of Object.entries(value)) {
        if (key === "fr" && typeof child === "string") out.push([`${path}.fr`, child]);
        else french(child, `${path}.${key}`, out);
      }
    }
    return out;
  }

  it("French puts a non-breaking space before : ; ? ! and inside « »", () => {
    const bad = french(JSON.parse(readFileSync(resolve(process.cwd(), "public/haven-app.json"), "utf8")))
      .filter(([, text]) => / [:;?!»]|« /.test(text))
      .map(([path]) => path);
    expect(bad).toEqual([]);
  });
});
