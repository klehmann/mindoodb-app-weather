<!--
  Hero block of a location card: place name, big temperature, a short
  condition label, and today's high/low. Layout and spacing mirrors the
  iOS Weather landing view.
-->
<template>
  <header class="current">
    <h2 class="current__name">{{ displayName }}</h2>
    <p v-if="subtitle" class="current__subtitle">{{ subtitle }}</p>
    <div class="current__temp">{{ temperatureLabel }}</div>
    <p class="current__condition">{{ conditionLabel }}</p>
    <p class="current__range">
      <span>{{ t("current.high", { value: highLabel }) }}</span>
      <span class="current__range-sep">·</span>
      <span>{{ t("current.low", { value: lowLabel }) }}</span>
    </p>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { CurrentConditions as CurrentSnapshot, DailyPoint, ResolvedLocation } from "@/domain/types";
import type { Units } from "@/services/launchParams";
import { conditionI18nKey } from "@/domain/weatherCode";
import { formatTemperature } from "@/domain/formatting";

const props = defineProps<{
  location: ResolvedLocation;
  current: CurrentSnapshot;
  today: DailyPoint | null;
  units: Units;
}>();

const { t } = useI18n();

const displayName = computed(() => props.location.displayName);
const subtitle = computed(() => {
  const parts = [props.location.admin1, props.location.country].filter(Boolean) as string[];
  return parts.join(", ");
});
const temperatureLabel = computed(() => formatTemperature(props.current.temperature, props.units));
const conditionLabel = computed(() => t(conditionI18nKey(props.current.weatherCode)));
const highLabel = computed(() =>
  formatTemperature(props.today?.tempMax ?? props.current.temperature, props.units),
);
const lowLabel = computed(() =>
  formatTemperature(props.today?.tempMin ?? props.current.temperature, props.units),
);
</script>

<style scoped>
.current {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 1rem 1.25rem 1.25rem;
  text-align: center;
}

.current__name {
  margin: 0;
  font-size: clamp(1.6rem, 2.2vw, 2rem);
  font-weight: 400;
  letter-spacing: 0.01em;
}

.current__subtitle {
  margin: 0 0 0.4rem;
  color: var(--text-soft);
  font-size: 0.95rem;
}

.current__temp {
  font-size: clamp(5rem, 12vw, 7.5rem);
  font-weight: 200;
  letter-spacing: -0.04em;
  line-height: 1;
}

.current__condition {
  margin: 0.2rem 0 0.2rem;
  color: var(--text-soft);
  font-size: 1.1rem;
}

.current__range {
  display: inline-flex;
  gap: 0.4rem;
  margin: 0;
  color: var(--text-soft);
  font-size: 1rem;
}

.current__range-sep {
  opacity: 0.7;
}
</style>
