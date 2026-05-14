# MindooDB Weather — Haven sample app

A responsive, iOS-Weather-style weather tile for [MindooDB
Haven](https://mindoodb.com). It renders a beautiful forecast for one
or more locations configured through a Haven **app parameter**, and
uses the free, keyless [Open-Meteo](https://open-meteo.com) APIs for
all data.

The goal of this project is to show how a third-party Haven app can
look and feel like a first-class native tile while staying entirely
client-side. It complements [`mindoodb-app-example`](../mindoodb-app-example)
which focuses on the SDK's database and view APIs; this app
concentrates on the **UX side of the SDK**: launch parameters,
viewport events, and responsive embedding.

## What it does

- Reads a list of human-readable locations from the `locations`
  launch parameter (e.g. `Berlin, Germany;Karlsruhe, Germany;Washington, USA`).
- Resolves each entry via Open-Meteo's geocoding API and caches the
  result in `localStorage`.
- Fetches a 10-day forecast plus hourly data, current conditions, and
  air quality for every resolved location.
- Presents each location as a swipeable glass card over a full-bleed
  photographic background that matches the condition (clear /
  partly-cloudy / cloudy / rain / snow / storm, day or night).
- Adapts to the tile size Haven reports via `onViewportChange`:
  narrow → single card with dots, wider → 2–4 cards at a time.

## App parameters

| Name | Required | Default | Format & meaning |
|---|---|---|---|
| `locations` | no | `"New York City;Berlin;Singapur"` | Semicolon-separated list of free-form queries: `"Berlin, Deutschland;Karlsruhe, Deutschland;Washington, USA"`. Entries are trimmed and de-duplicated. When omitted or empty, the app falls back to that three-city default so the tile is immediately useful with zero configuration. Note: Open-Meteo's geocoder expects country names in their native language (e.g. `Deutschland`, not `Germany`; `USA` or `United States`). |
| `units` | no | `metric` | `metric` → °C / km/h / mm / hPa / km. `imperial` → °F / mph / in / inHg / miles. |
| `refreshIntervalMinutes` | no | `0` | Integer minutes between automatic refreshes. `0` disables background refresh. Maximum `1440`. |

Parameters are parsed in [`src/services/launchParams.ts`](./src/services/launchParams.ts).
Unknown keys are ignored.

## Registering the app in Haven

1. Open a Haven workspace and drop a **Weather** tile into a space.
2. Set the tile's URL to a running instance of this app (see below
   for dev / Cloudflare Pages options).
3. Optionally override `locations` (semicolon-separated) and any of
   the other parameters in the tile's app parameters — with no
   parameters at all the tile will show forecasts for New York City,
   Berlin, and Singapur out of the box.
4. Reload the tile; the first location card appears as soon as the
   geocoder returns, then the full forecast is fetched in the
   background.

## Running the app

### Local development against the published SDK

```bash
pnpm install
pnpm dev
```

The dev server listens on <http://localhost:4205>. You can preview
the app outside Haven by passing parameters as URL query strings, for
example:

```
http://localhost:4205/?locations=Berlin%2C%20Germany%3BKarlsruhe%2C%20Germany&units=metric
```

### Local development against sibling MindooDB sources

If you're iterating on the Haven app SDK in the same workspace, use
the `:local` variants to alias the sources instead of the published
package:

```bash
pnpm dev:local      # aliases ../mindoodb-app-sdk/src
pnpm build:local    # ditto, for a production build
```

### Cloudflare Pages deployment

Deploying the bundle to [Cloudflare Pages](https://pages.cloudflare.com)
mirrors the workflow used by `mindoodb-app-example`:

```bash
pnpm build
pnpm deploy         # builds + wrangler deploy
pnpm preview        # local Pages preview of the built assets
```

The [`wrangler.jsonc`](./wrangler.jsonc) config treats `./dist` as
the asset directory and serves it as a single-page application.

## Data sources

- Forecast: <https://api.open-meteo.com/v1/forecast>
- Geocoding: <https://geocoding-api.open-meteo.com/v1/search>
- Air quality: <https://air-quality-api.open-meteo.com/v1/air-quality>

All three endpoints are key-less and CORS-friendly, which makes them
ideal for a sandboxed iframe in Haven: no secrets ever need to leave
the tile's bundle.

Please respect Open-Meteo's [terms of use](https://open-meteo.com/en/terms)
if you redistribute or deploy the app publicly.

## Visual treatment

The app deliberately uses a **single visual treatment** (always-light
text over a photographic background), regardless of Haven's
light/dark theme setting — matching iOS Weather's behaviour. The
SDK's `onThemeChange` hook is still subscribed for platform
consistency, but its value is not applied to the UI. The background
image (tied to the active card's visual state and day/night) is the
sole "theme" driver.

## Project layout

```
src/
├── main.ts                       # createApp, i18n install, mount
├── App.vue                       # shell: background + carousel
├── app/                          # composables: SDK session, orchestrator
├── features/
│   ├── carousel/                 # Swiper wrapper + pagination
│   ├── card/                     # LocationCard + sub-components
│   │   └── info/                 # InfoGrid + info tiles
│   ├── error/                    # ErrorCard placeholder tile
│   └── background/               # Full-bleed crossfading bg
├── services/                     # geocoding.ts, openMeteo.ts, airQuality.ts, cache.ts, launchParams.ts
├── domain/                       # WMO mapping, formatters, time helpers, UV/AQI/wind/pressure bands
├── i18n/                         # vue-i18n setup + en/de bundles
├── shared/                       # GlassCard, WeatherIcon, LoadingDots, styles
└── tests/                        # Vitest unit tests
```

## Extending the app

- **More languages**: drop a new file next to `src/i18n/en.ts` and
  add it to `src/i18n/index.ts`.
- **More visual states**: bump the mapping in
  `src/domain/weatherCode.ts` and add new background images under
  `public/backgrounds/` using the naming convention `<state>-<day|night>.jpg`.
- **Different icon set**: swap the inline SVGs in
  `src/shared/components/WeatherIcon.vue` for an icon font like
  [Meteocons](https://github.com/basmilius/weather-icons).
- **Additional metrics**: add more parameters to the Open-Meteo query
  in `src/services/openMeteo.ts` and render them as new info tiles
  under `src/features/card/info/`.

## Running the tests

```bash
pnpm test       # runs Vitest once
pnpm test:watch # watch mode
```

Tests cover launch-parameter parsing, WMO → visual-state mapping,
UV / AQI band classification, wind direction rounding, pressure
trend detection, and the localStorage cache layer.
