<!--
  10-row daily forecast, mirroring the iOS Weather layout:
  weekday · icon · min temp · temperature bar · max temp.
-->
<template>
  <div class="daily glass-card">
    <h3 class="panel-title">
      <span>{{ t("daily.title") }}</span>
    </h3>

    <ol class="daily__list">
      <li
        v-for="row in rows"
        :key="row.day.date"
        class="daily__row"
        :class="{ 'daily__row--today': row.isToday }"
      >
        <span class="daily__label">{{ row.label }}</span>
        <WeatherIcon class="daily__icon" :condition="row.condition" />
        <span class="daily__min">{{ row.minLabel }}</span>
        <TemperatureBar
          class="daily__bar"
          :day-min="row.day.tempMin"
          :day-max="row.day.tempMax"
          :global-min="globalMin"
          :global-max="globalMax"
          :now="row.isToday ? currentTemperature : null"
        />
        <span class="daily__max">{{ row.maxLabel }}</span>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { DailyPoint } from "@/domain/types";
import type { Units } from "@/services/launchParams";
import type { VisualCondition } from "@/domain/types";
import TemperatureBar from "@/features/card/TemperatureBar.vue";
import WeatherIcon from "@/shared/components/WeatherIcon.vue";
import { resolveDayOrNight, toVisualCondition } from "@/domain/weatherCode";
import { formatWeekdayShort } from "@/domain/time";
import { formatTemperature } from "@/domain/formatting";
import { toBcp47 } from "@/i18n";

const props = defineProps<{
  daily: DailyPoint[];
  todayIso: string;
  currentTemperature: number;
  units: Units;
}>();

const { t, locale } = useI18n();

const globalMin = computed(() =>
  props.daily.length ? props.daily.reduce((acc, d) => Math.min(acc, d.tempMin), Infinity) : 0,
);
const globalMax = computed(() =>
  props.daily.length ? props.daily.reduce((acc, d) => Math.max(acc, d.tempMax), -Infinity) : 0,
);

const rows = computed(() => {
  const tz = toBcp47(locale.value as "de" | "en");
  const todayDate = props.todayIso.slice(0, 10);
  return props.daily.map((day) => {
    const isToday = day.date === todayDate;
    const period = resolveDayOrNight({ isDay: true });
    const condition: VisualCondition = toVisualCondition(day.weatherCode, period);
    const label = isToday ? t("daily.today") : formatWeekdayShort(day.date, tz);
    return {
      day,
      isToday,
      condition,
      label,
      minLabel: formatTemperature(day.tempMin, props.units),
      maxLabel: formatTemperature(day.tempMax, props.units),
    };
  });
});
</script>

<style scoped>
.daily {
  margin: 0 0 0.85rem;
}

.daily__list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
  padding: 0.25rem 0;
  list-style: none;
}

.daily__row {
  display: grid;
  grid-template-columns: 3.2rem 1.8rem 2.2rem 1fr 2.2rem;
  gap: 0.75rem;
  align-items: center;
  padding: 0.55rem 1rem;
  border-top: 1px solid var(--glass-divider);
}

.daily__row:first-child {
  border-top: none;
}

.daily__row--today {
  font-weight: 600;
}

.daily__label {
  color: var(--text-soft);
  font-size: 1rem;
}

.daily__icon {
  font-size: 1.6rem;
  justify-self: center;
}

.daily__min {
  color: var(--text-muted);
  justify-self: end;
  font-size: 0.95rem;
}

.daily__bar {
  min-width: 3rem;
}

.daily__max {
  color: var(--text);
  justify-self: end;
  font-size: 0.95rem;
}
</style>
