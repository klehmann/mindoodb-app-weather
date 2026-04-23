/**
 * vue-i18n configuration for the weather app.
 *
 * Supported locales: `de` and `en`. The active locale is detected from
 * `navigator.language` at startup; anything that isn't explicitly
 * German falls back to English so the UI stays coherent even in
 * languages we haven't translated yet.
 *
 * @module i18n
 */
import { createI18n } from "vue-i18n";

import en from "./en";
import de from "./de";

export type AppLocale = "de" | "en";

/**
 * Detect the best-match locale for the current runtime.
 *
 * @param overrides  Optional explicit override (future-proofing in case
 *                   Haven starts passing a UI locale via launch params).
 */
export function detectLocale(overrides: { explicit?: string | null } = {}): AppLocale {
  const explicit = overrides.explicit?.toLowerCase();
  if (explicit?.startsWith("de")) {
    return "de";
  }
  if (explicit?.startsWith("en")) {
    return "en";
  }
  if (typeof navigator !== "undefined" && typeof navigator.language === "string") {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith("de")) {
      return "de";
    }
  }
  return "en";
}

/**
 * Map our 2-letter app locale to a BCP-47 tag suitable for
 * `Intl.DateTimeFormat` etc. We intentionally fix these to locale+region
 * pairs so formatting (especially hour cycle) is predictable.
 */
export function toBcp47(locale: AppLocale): string {
  return locale === "de" ? "de-DE" : "en-US";
}

export function createAppI18n(locale: AppLocale = detectLocale()) {
  return createI18n({
    legacy: false,
    globalInjection: true,
    locale,
    fallbackLocale: "en",
    messages: { en, de },
  });
}
