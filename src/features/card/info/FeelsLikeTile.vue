<template>
  <InfoTile :label="t('current.feelsLike')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0z" />
        <circle cx="12" cy="17" r="2" fill="currentColor" />
      </svg>
    </template>
    <span>{{ apparentLabel }}</span>
    <template #footer>
      <span>{{ deltaLabel }}</span>
    </template>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import type { Units } from "@/services/launchParams";
import { formatSignedDegrees, formatTemperature } from "@/domain/formatting";

const props = defineProps<{
  apparentTemperature: number;
  temperature: number;
  units: Units;
}>();

const { t } = useI18n();

const apparentLabel = computed(() => formatTemperature(props.apparentTemperature, props.units));

const deltaLabel = computed(() =>
  t("current.feelsLikeDelta", {
    delta: formatSignedDegrees(props.apparentTemperature - props.temperature),
  }),
);
</script>
