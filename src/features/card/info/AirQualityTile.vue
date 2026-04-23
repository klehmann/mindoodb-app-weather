<template>
  <InfoTile :label="t('current.airQuality')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 8h12a3 3 0 1 0-3-3" />
        <path d="M4 14h16a3 3 0 1 1-3 3" />
        <path d="M4 20h8" />
      </svg>
    </template>
    <span>{{ indexLabel }}</span>
    <template #footer>
      <span>{{ t(bandInfo.i18nKey) }} · {{ scaleLabel }}</span>
    </template>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import type { AirQualitySnapshot } from "@/domain/types";
import { classifyAqi } from "@/domain/airQuality";

const props = defineProps<{
  airQuality: AirQualitySnapshot;
}>();

const { t } = useI18n();

const indexLabel = computed(() => Math.round(props.airQuality.index).toString());
const bandInfo = computed(() => classifyAqi(props.airQuality.index, props.airQuality.scale));
const scaleLabel = computed(() =>
  props.airQuality.scale === "european" ? t("current.airQualityScaleEuropean") : t("current.airQualityScaleUs"),
);
</script>
