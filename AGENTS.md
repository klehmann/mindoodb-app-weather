# AGENTS.md

Notes for people and coding agents working on this repo.

## Languages

Every user-facing string ships in all languages the product supports, in the same
change that adds it: labels, buttons, placeholders, empty states, errors,
`aria-label`s, notifications and dialogs. For Haven and its apps that is
**en, de, es, fr, it, nb, nl, pl** — never only English, never only English and German.

- **Make a gap impossible to merge.** Typed tables
  (`satisfies Record<Locale, Messages>`, `Messages` derived from English), in Rust a
  `match` over the language enum, or — with one file per locale — a test that compares
  every locale's keys and `{placeholders}` with `en`. Falling back to English is for
  languages Haven does not offer, not for strings nobody translated.
- **Map the tag** by its primary subtag: `de-AT` → `de`, `no`/`nn` → `nb`, anything
  else → `en`. Dates and numbers go through `Intl` with the active locale.
- **Say it as Haven says it.** Haven's terms (database, tenant, attachment, …) and its
  form of address: German *du*, Spanish *tú*, French *vous*, Italian *tu*,
  Norwegian *du*, Dutch *je*, Polish informal.

**In this repo:** strings are in `src/i18n/<locale>.ts` (en, de, es, fr, it, nb, nl, pl),
each `satisfies Messages` (derived from `en.ts`); `src/i18n/index.ts` maps Haven's UI locale
(launch context + `onLocaleChange`, else `navigator.language`) and `src/tests/i18n.test.ts`
checks keys and `{placeholders}`. Place names come from the Open-Meteo geocoder in the UI
language. The boot-failure text inline in `index.html` has its own eight-language table.
Listing texts in `public/haven-app.json` are in all eight languages.
