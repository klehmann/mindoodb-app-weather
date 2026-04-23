<!--
  One swipeable weather card. Renders the hero, the condition summary,
  the hourly strip, the daily forecast, and the responsive info grid
  for a single resolved location.

  Rendering logic:
  - If no forecast is available yet, we show a lightweight skeleton.
  - If a forecast fetch failed but we had a cached snapshot, we still
    render the cached data and surface a small "offline" notice.
-->
<template>
  <article class="location-card" :class="{ 'location-card--loading': !current }">
    <template v-if="current && today">
      <CurrentConditions
        :location="tile.location"
        :current="current"
        :today="today"
        :units="units"
      />

      <ConditionSummary :today="today" :upcoming-hours="upcomingHours" />

      <HourlyStrip
        :hourly="forecast!.hourly"
        :daily="forecast!.daily"
        :units="units"
        :now-iso="current.time"
      />

      <DailyForecast
        :daily="forecast!.daily"
        :today-iso="current.time"
        :current-temperature="current.temperature"
        :units="units"
      />

      <InfoGrid
        :current="current"
        :today="today"
        :hourly="forecast!.hourly"
        :air-quality="tile.airQuality"
        :units="units"
      />

      <p v-if="tile.forecastError && forecast" class="location-card__stale">
        {{ t("app.offline") }}
      </p>
    </template>

    <template v-else>
      <div class="location-card__skeleton">
        <h2 class="location-card__skeleton-name">{{ tile.location.displayName }}</h2>
        <LoadingDots />
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { LocationTile } from "@/app/useWeatherApp";
import type { Units } from "@/services/launchParams";
import CurrentConditions from "@/features/card/CurrentConditions.vue";
import ConditionSummary from "@/features/card/ConditionSummary.vue";
import HourlyStrip from "@/features/card/HourlyStrip.vue";
import DailyForecast from "@/features/card/DailyForecast.vue";
import InfoGrid from "@/features/card/info/InfoGrid.vue";
import LoadingDots from "@/shared/components/LoadingDots.vue";

const props = defineProps<{
  tile: Extract<LocationTile, { kind: "ready" }>;
  units: Units;
}>();

const { t } = useI18n();

const forecast = computed(() => props.tile.forecast);
const current = computed(() => forecast.value?.current ?? null);
const today = computed(() => {
  const data = forecast.value;
  if (!data || !data.current) {
    return null;
  }
  const todayDate = data.current.time.slice(0, 10);
  return data.daily.find((day) => day.date === todayDate) ?? data.daily[0] ?? null;
});
const upcomingHours = computed(() => forecast.value?.hourly.slice(0, 12) ?? []);
</script>

<style scoped>
.location-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 1rem;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  scrollbar-width: thin;
  color: var(--text);
}

.location-card__skeleton {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 20rem;
  padding: 3rem 1rem;
}

.location-card__skeleton-name {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 400;
}

.location-card__stale {
  margin: -0.3rem 0 0.5rem;
  padding: 0.4rem 0.75rem;
  color: var(--text-muted);
  font-size: 0.85rem;
  text-align: center;
}
</style>
