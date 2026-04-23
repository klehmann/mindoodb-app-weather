<template>
  <InfoTile :label="t('current.pressure')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 12l4-3" />
      </svg>
    </template>
    <div class="pressure__value">
      <span>{{ valueLabel }}</span>
      <span v-if="trendGlyph" class="pressure__trend" :data-trend="trend">{{ trendGlyph }}</span>
    </div>
    <template #footer>
      <span>{{ trendLabel }}</span>
    </template>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import type { Units } from "@/services/launchParams";
import { formatPressure } from "@/domain/formatting";
import { computePressureTrend } from "@/domain/pressureTrend";

const props = defineProps<{
  pressureHpa: number;
  hourlyPressureSamples: Array<number | null>;
  units: Units;
}>();

const { t } = useI18n();

const valueLabel = computed(() => formatPressure(props.pressureHpa, props.units));

const trendInfo = computed(() => computePressureTrend(props.hourlyPressureSamples));
const trend = computed(() => trendInfo.value.trend);

const trendGlyph = computed(() => {
  switch (trend.value) {
    case "rising":
      return "↑";
    case "falling":
      return "↓";
    default:
      return "·";
  }
});

const trendLabel = computed(() => t(`pressure.trend.${trend.value}`));
</script>

<style scoped>
.pressure__value {
  display: flex;
  align-items: baseline;
  gap: 0.3rem;
}

.pressure__trend {
  color: var(--text-soft);
  font-size: 1rem;
}

.pressure__trend[data-trend="rising"] {
  color: #89e0a2;
}
.pressure__trend[data-trend="falling"] {
  color: #ffb497;
}
</style>
