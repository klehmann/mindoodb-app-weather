<template>
  <InfoTile :label="t('current.visibility')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </template>
    <span>{{ valueLabel }}</span>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import type { Units } from "@/services/launchParams";
import { formatVisibility } from "@/domain/formatting";

const props = defineProps<{
  visibilityMetres: number;
  units: Units;
}>();

const { t } = useI18n();

const valueLabel = computed(() => formatVisibility(props.visibilityMetres, props.units));
</script>
