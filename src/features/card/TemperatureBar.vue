<!--
  Gradient bar representing the temperature range for a single day,
  positioned within the global min/max range of the whole 10-day
  forecast. A small marker highlights the current temperature (the
  "today" dot) when it falls inside this day's range.
-->
<template>
  <div class="temp-bar" :aria-label="ariaLabel">
    <div
      class="temp-bar__fill"
      :style="{
        left: `${fillStart * 100}%`,
        width: `${(fillEnd - fillStart) * 100}%`,
        background: fillGradient,
      }"
    />
    <div
      v-if="nowMarkerPos !== null"
      class="temp-bar__marker"
      :style="{ left: `${nowMarkerPos * 100}%` }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  dayMin: number;
  dayMax: number;
  globalMin: number;
  globalMax: number;
  now?: number | null;
  ariaLabel?: string;
}>();

function normalize(value: number): number {
  if (props.globalMax === props.globalMin) {
    return 0.5;
  }
  return Math.max(0, Math.min(1, (value - props.globalMin) / (props.globalMax - props.globalMin)));
}

const fillStart = computed(() => normalize(props.dayMin));
const fillEnd = computed(() => normalize(props.dayMax));

const fillGradient = computed(
  () =>
    `linear-gradient(to right,
      rgba(120, 180, 255, 0.9) 0%,
      rgba(255, 220, 120, 0.9) 50%,
      rgba(255, 140, 90, 0.95) 100%)`,
);

const nowMarkerPos = computed(() => {
  const value = props.now;
  if (value === null || value === undefined) {
    return null;
  }
  if (value < props.dayMin || value > props.dayMax) {
    return null;
  }
  return normalize(value);
});
</script>

<style scoped>
.temp-bar {
  position: relative;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  overflow: visible;
}

.temp-bar__fill {
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
}

.temp-bar__marker {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  margin-left: -5px;
  margin-top: -5px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.22);
}
</style>
