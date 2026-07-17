<!--
  Application shell. Orchestrates the full-bleed background layer, the
  Swiper-based carousel, and the per-tile cards. Fetching and SDK
  lifecycle all live inside `useWeatherApp`; this component is a thin
  presentational wrapper.
-->
<template>
  <div class="app">
    <WeatherBackground :condition="activeCondition" />

    <section
      v-if="updateAvailable"
      class="app__update-banner glass-card glass-card--strong"
      role="status"
      aria-live="polite"
    >
      <button
        type="button"
        class="app__update-close"
        :aria-label="t('app.update.close')"
        @click="dismissUpdate"
      >
        &times;
      </button>
      <div class="app__update-copy">
        <strong>{{ t("app.update.title") }}</strong>
        <p>{{ t("app.update.body") }}</p>
      </div>
      <button
        type="button"
        class="app__update-reload"
        :disabled="updateReloading"
        @click="reloadForUpdate"
      >
        {{ updateReloading ? t("app.update.reloading") : t("app.update.reload") }}
      </button>
    </section>

    <main class="app__main">
      <template v-if="tiles.length === 0">
        <section class="app__empty glass-card glass-card--strong">
          <h1 class="app__empty-title">{{ t("app.emptyConfiguration") }}</h1>
          <p class="app__empty-hint">{{ t("app.emptyConfigurationHint") }}</p>
          <p v-if="connectError" class="app__empty-error">{{ connectError }}</p>
        </section>
      </template>

      <LocationCarousel
        v-else
        :tiles="tiles"
        :viewport-width="viewportWidth"
        @update:active-index="onActiveIndexChange"
      >
        <template #default="{ tile }">
          <LocationCard
            v-if="tile.kind === 'ready'"
            :tile="tile"
            :units="units"
          />
          <ErrorCard
            v-else-if="tile.kind === 'error'"
            :query="tile.query"
            :detail="tile.error"
          />
          <article v-else class="app__loading-card glass-card">
            <h2>{{ tile.query }}</h2>
            <LoadingDots />
          </article>
        </template>
      </LocationCarousel>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";

import type { VisualCondition } from "@/domain/types";
import { useWeatherApp } from "@/app/useWeatherApp";
import { resolveDayOrNight, toVisualCondition } from "@/domain/weatherCode";
import LocationCarousel from "@/features/carousel/LocationCarousel.vue";
import LocationCard from "@/features/card/LocationCard.vue";
import ErrorCard from "@/features/error/ErrorCard.vue";
import WeatherBackground from "@/features/background/WeatherBackground.vue";
import LoadingDots from "@/shared/components/LoadingDots.vue";
import { useWeatherAppUpdate } from "@/pwa/appUpdate";

const { t, locale } = useI18n();
const { updateAvailable, updateReloading, reloadForUpdate, dismissUpdate } = useWeatherAppUpdate();

// Cast: vue-i18n's locale ref is `WritableComputedRef<string>`; our
// composables narrow to `"de" | "en"` based on detection logic.
const appLocale = computed({
  get: () => (locale.value === "de" ? ("de" as const) : ("en" as const)),
  set: (value: "de" | "en") => {
    locale.value = value;
  },
});

const app = useWeatherApp(appLocale);
const { tiles, units, session, start } = app;
const { viewport, connectError } = session;

const activeIndex = ref(0);

function onActiveIndexChange(index: number) {
  activeIndex.value = index;
}

const viewportWidth = computed(() => viewport.value?.width ?? null);

const activeCondition = computed<VisualCondition | null>(() => {
  const tile = tiles.value[activeIndex.value];
  if (!tile || tile.kind !== "ready" || !tile.forecast) {
    return null;
  }
  const current = tile.forecast.current;
  const today = tile.forecast.daily[0];
  const period = resolveDayOrNight({
    isDay: current.isDay,
    timeIso: current.time,
    sunriseIso: today?.sunrise,
    sunsetIso: today?.sunset,
  });
  return toVisualCondition(current.weatherCode, period);
});

onMounted(() => {
  void start();
});
</script>

<style scoped>
.app {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  color: var(--text);
}

.app__update-banner {
  position: fixed;
  z-index: 40;
  left: 1rem;
  right: 1rem;
  bottom: 1rem;
  margin: 0 auto;
  max-width: 40rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem 2.5rem 1rem 1rem;
}

.app__update-close {
  position: absolute;
  top: 0.65rem;
  right: 0.65rem;
  border: 0;
  background: transparent;
  color: inherit;
  opacity: 0.7;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.app__update-copy {
  display: grid;
  gap: 0.25rem;
}

.app__update-copy p {
  margin: 0;
  opacity: 0.85;
  font-size: 0.9rem;
}

.app__update-reload {
  align-self: flex-start;
  border: 0;
  border-radius: 999px;
  padding: 0.45rem 0.9rem;
  background: color-mix(in srgb, var(--text) 14%, transparent);
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.app__update-reload:disabled {
  opacity: 0.6;
  cursor: progress;
}

@media (min-width: 640px) {
  .app__update-banner {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.app__main {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  padding: clamp(0.5rem, 1.5vw, 1.25rem);
}

.app__empty {
  margin: auto;
  padding: 2.5rem;
  max-width: 36rem;
  text-align: center;
  color: var(--text);
}

.app__empty-title {
  margin: 0 0 0.75rem;
  font-size: 1.4rem;
  font-weight: 500;
}

.app__empty-hint {
  margin: 0;
  color: var(--text-soft);
  font-size: 1rem;
  line-height: 1.45;
}

.app__empty-error {
  margin: 1rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.app__loading-card {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  margin: 1rem;
  min-height: 16rem;
}
</style>
