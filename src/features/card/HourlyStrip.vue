<!--
  Horizontally-scrollable strip of hourly forecasts. Shows 24 slots
  starting from the current hour. The first slot is labelled "Now" /
  "Jetzt" while the rest show a localized hour-of-day label.
-->
<template>
  <div class="hourly glass-card">
    <h3 class="panel-title">
      <span>{{ t("hourly.title") }}</span>
    </h3>

    <ol class="hourly__list">
      <li
        v-for="(entry, index) in entries"
        :key="entry.time"
        class="hourly__item"
        :class="{ 'hourly__item--now': index === 0 }"
      >
        <span class="hourly__label">{{ entry.label }}</span>
        <WeatherIcon class="hourly__icon" :condition="entry.condition" />
        <span v-if="entry.precipProb && entry.precipProb > 20" class="hourly__precip">
          {{ entry.precipProb }}%
        </span>
        <span class="hourly__temp">{{ entry.temp }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { DailyPoint, HourlyPoint } from "@/domain/types";
import type { Units } from "@/services/launchParams";
import type { VisualCondition } from "@/domain/types";
import WeatherIcon from "@/shared/components/WeatherIcon.vue";
import { resolveDayOrNight, toVisualCondition } from "@/domain/weatherCode";
import { formatHourLabel } from "@/domain/time";
import { formatTemperature } from "@/domain/formatting";
import { toBcp47 } from "@/i18n";

const props = defineProps<{
  hourly: HourlyPoint[];
  daily: DailyPoint[];
  units: Units;
  nowIso: string;
}>();

const { t, locale } = useI18n();

const entries = computed(() => {
  const now = props.nowIso;
  const tz = toBcp47(locale.value as "de" | "en");

  const futureIndex = props.hourly.findIndex((hour) => hour.time >= now);
  const start = futureIndex === -1 ? 0 : futureIndex;
  const window = props.hourly.slice(start, start + 24);

  return window.map((hour, index) => {
    const day = props.daily.find((d) => d.date === hour.time.slice(0, 10));
    const period = resolveDayOrNight({
      timeIso: hour.time,
      sunriseIso: day?.sunrise,
      sunsetIso: day?.sunset,
    });
    const condition: VisualCondition = toVisualCondition(hour.weatherCode, period);
    const label = index === 0 ? t("hourly.now") : formatHourLabel(hour.time, tz);
    return {
      time: hour.time,
      label,
      condition,
      precipProb: hour.precipitationProbability,
      temp: formatTemperature(hour.temperature, props.units),
    };
  });
});
</script>

<style scoped>
.hourly {
  margin: 0 0 0.85rem;
}

.hourly__list {
  display: flex;
  gap: 0.1rem;
  margin: 0;
  padding: 0.6rem 0.6rem 0.85rem;
  list-style: none;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  scroll-snap-type: x mandatory;
}

.hourly__list::-webkit-scrollbar {
  display: none;
}

.hourly__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  min-width: 3.4rem;
  padding: 0.5rem 0.4rem;
  border-radius: 14px;
  font-size: 0.9rem;
  scroll-snap-align: start;
}

.hourly__item--now {
  font-weight: 600;
}

.hourly__label {
  color: var(--text-soft);
  font-size: 0.85rem;
}

.hourly__icon {
  font-size: 1.6rem;
}

.hourly__precip {
  color: #9bd3ff;
  font-size: 0.75rem;
  margin-top: -0.3rem;
}

.hourly__temp {
  font-size: 1rem;
  font-weight: 500;
}
</style>
