<template>
  <InfoTile :label="t('current.humidity')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 3c4 5 7 8 7 12a7 7 0 1 1-14 0c0-4 3-7 7-12z" />
      </svg>
    </template>
    <span>{{ valueLabel }}</span>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import { formatPercent } from "@/domain/formatting";

const props = defineProps<{
  humidity: number;
}>();

const { t } = useI18n();

const valueLabel = computed(() => formatPercent(props.humidity));
</script>
