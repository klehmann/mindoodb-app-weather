<template>
  <InfoTile :label="t('current.uvIndex')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3m0 14v3M2 12h3m14 0h3M4.93 4.93l2.12 2.12m9.9 9.9 2.12 2.12M4.93 19.07l2.12-2.12m9.9-9.9 2.12-2.12" />
      </svg>
    </template>
    <span>{{ valueLabel }}</span>
    <template #footer>
      <span>{{ bandLabel }}</span>
      <span v-if="todayMaxLabel"> · {{ todayMaxLabel }}</span>
    </template>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import { classifyUvIndex } from "@/domain/uvIndex";

const props = defineProps<{
  uvIndex: number | null;
  uvIndexMaxToday: number | null;
}>();

const { t } = useI18n();

const valueLabel = computed(() => {
  const v = props.uvIndex;
  return v === null || v === undefined ? "–" : Math.round(v).toString();
});

const bandLabel = computed(() => t(classifyUvIndex(props.uvIndex).i18nKey));

const todayMaxLabel = computed(() => {
  const v = props.uvIndexMaxToday;
  if (v === null || v === undefined) {
    return null;
  }
  return t("current.uvIndexMaxToday", { value: Math.round(v) });
});
</script>
