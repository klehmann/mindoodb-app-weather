<!--
  Short sentence that describes the upcoming weather change, styled like
  the grey "strip" that sits above the hourly forecast in iOS Weather.
-->
<template>
  <div v-if="summary" class="summary glass-card">
    <span class="summary__text">{{ summary }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { DailyPoint, HourlyPoint } from "@/domain/types";
import { visualStateForCode } from "@/domain/weatherCode";
import { formatClockTime } from "@/domain/time";
import { toBcp47, type AppLocale } from "@/i18n";

const props = defineProps<{
  today: DailyPoint | null;
  upcomingHours: HourlyPoint[];
}>();

const { t, locale } = useI18n();

const summary = computed(() => {
  if (!props.today) {
    return null;
  }
  const rainHour = props.upcomingHours.find(
    (hour) => visualStateForCode(hour.weatherCode) === "rain",
  );
  if (rainHour) {
    const time = formatClockTime(rainHour.time, toBcp47(locale.value as AppLocale));
    return t("condition.rainAt", { time });
  }
  return t(`condition.state.${visualStateForCode(props.today.weatherCode)}`);
});
</script>

<style scoped>
.summary {
  margin: 0 0 0.85rem;
  padding: 0.75rem 1rem;
}

.summary__text {
  color: var(--text-soft);
  font-size: 0.95rem;
  line-height: 1.35;
}
</style>
