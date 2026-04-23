<template>
  <InfoTile :label="t('current.wind')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 8h11a3 3 0 1 0-3-3" />
        <path d="M3 14h14a3 3 0 1 1-3 3" />
        <path d="M3 20h7" />
      </svg>
    </template>
    <span>{{ speedLabel }}</span>
    <template #footer>
      <span>{{ directionLabel }}</span>
    </template>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import type { Units } from "@/services/launchParams";
import { windDirectionFromDegrees } from "@/domain/windDirection";
import { formatWindSpeed } from "@/domain/formatting";

const props = defineProps<{
  windSpeed: number;
  windDirectionDeg: number;
  units: Units;
}>();

const { t } = useI18n();

const speedLabel = computed(() => formatWindSpeed(props.windSpeed, props.units));

const directionLabel = computed(() => {
  const direction = windDirectionFromDegrees(props.windDirectionDeg);
  return t("wind.fromDirection", { direction: t(direction.i18nKey) });
});
</script>
