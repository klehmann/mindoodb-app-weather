/**
 * vue-i18n configuration for the weather app.
 *
 * Supported locales are the languages Haven offers: en, de, es, fr, it, nb,
 * nl, pl. Every locale file is typed against the English shape
 * (`Messages`), so a missing key fails the typecheck; `i18n.test.ts`
 * additionally compares `{placeholders}`.
 *
 * The active locale comes from Haven's launch context (and follows
 * `onLocaleChange`); before the bridge connects, and when running
 * standalone, `navigator.language` is used. Tags are mapped by their
 * primary subtag (`de-AT` → `de`, `no`/`nn` → `nb`); anything else is
 * English.
 *
 * @module i18n
 */
import { createI18n } from "vue-i18n";

import en, { type Messages } from "./en";
import de from "./de";
import es from "./es";
import fr from "./fr";
import it from "./it";
import nb from "./nb";
import nl from "./nl";
import pl from "./pl";

export type { Messages };

export const APP_LOCALES = ["en", "de", "es", "fr", "it", "nb", "nl", "pl"] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export const messages = { en, de, es, fr, it, nb, nl, pl } satisfies Record<AppLocale, Messages>;

export function isAppLocale(value: unknown): value is AppLocale {
  return typeof value === "string" && (APP_LOCALES as readonly string[]).includes(value);
}

/**
 * Map a BCP-47 tag to one of our locales by its primary subtag, or `null`
 * when the language is not supported.
 */
export function matchLocale(tag: string | null | undefined): AppLocale | null {
  if (!tag) {
    return null;
  }
  const primary = tag.trim().toLowerCase().split(/[-_]/)[0] ?? "";
  if (primary === "no" || primary === "nn") {
    return "nb";
  }
  return isAppLocale(primary) ? primary : null;
}

/**
 * Detect the best-match locale for the current runtime.
 *
 * @param overrides  Optional explicit tag (Haven's UI locale). It wins over
 *                   the browser language when it is set.
 */
export function detectLocale(overrides: { explicit?: string | null } = {}): AppLocale {
  if (overrides.explicit) {
    return matchLocale(overrides.explicit) ?? "en";
  }
  if (typeof navigator !== "undefined" && typeof navigator.language === "string") {
    return matchLocale(navigator.language) ?? "en";
  }
  return "en";
}

const BCP47: Record<AppLocale, string> = {
  en: "en-US",
  de: "de-DE",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  nb: "nb-NO",
  nl: "nl-NL",
  pl: "pl-PL",
};

/**
 * Map our app locale to a BCP-47 tag suitable for `Intl.DateTimeFormat`
 * etc. We intentionally fix these to locale+region pairs so formatting
 * (especially hour cycle) is predictable.
 */
export function toBcp47(locale: AppLocale): string {
  return BCP47[locale] ?? "en-US";
}

/**
 * Language code for the Open-Meteo geocoding API (`language=`), which
 * localizes place and country names. It knows Norwegian as `no`, not `nb`.
 */
export function toGeocodingLanguage(locale: AppLocale): string {
  return locale === "nb" ? "no" : locale;
}

export function createAppI18n(locale: AppLocale = detectLocale()) {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: "en",
    messages,
  });
}
