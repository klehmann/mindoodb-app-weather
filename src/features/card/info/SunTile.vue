<template>
  <InfoTile :label="t('current.sun')">
    <template #icon>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="14" r="3" />
        <path d="M3 20h18" />
        <path d="M12 11V3" />
        <path d="m5.5 7 1.5 1.5" />
        <path d="m17 8.5 1.5-1.5" />
      </svg>
    </template>
    <div class="sun__value">
      <span>{{ sunriseLabel }}</span>
    </div>
    <template #footer>
      <span>{{ t("current.sunset") }}: {{ sunsetLabel }}</span>
    </template>
  </InfoTile>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import InfoTile from "@/features/card/info/InfoTile.vue";
import { formatClockTime } from "@/domain/time";
import { toBcp47 } from "@/i18n";

const props = defineProps<{
  sunriseIso: string;
  sunsetIso: string;
}>();

const { t, locale } = useI18n();

const tz = computed(() => toBcp47(locale.value as "de" | "en"));
const sunriseLabel = computed(() => formatClockTime(props.sunriseIso, tz.value));
const sunsetLabel = computed(() => formatClockTime(props.sunsetIso, tz.value));
</script>

<style scoped>
.sun__value {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
}
</style>
