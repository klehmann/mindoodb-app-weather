<!--
  Stylized weather glyph for a given visual condition.

  We pick between ~12 carefully-drawn inline SVGs (6 states x day/night)
  so the sample app stays entirely self-contained -- no remote icon
  fonts, no additional dependencies. All shapes use currentColor so
  the icon inherits the card's text color.
-->
<template>
  <svg
    class="weather-icon"
    :viewBox="'0 0 64 64'"
    role="img"
    :aria-label="ariaLabel"
    :data-state="state"
    :data-period="period"
  >
    <template v-if="state === 'clear' && period === 'day'">
      <circle cx="32" cy="32" r="12" fill="#ffd36b" />
      <g stroke="#ffd36b" stroke-width="3" stroke-linecap="round">
        <line x1="32" y1="6" x2="32" y2="14" />
        <line x1="32" y1="50" x2="32" y2="58" />
        <line x1="6" y1="32" x2="14" y2="32" />
        <line x1="50" y1="32" x2="58" y2="32" />
        <line x1="13" y1="13" x2="19" y2="19" />
        <line x1="45" y1="45" x2="51" y2="51" />
        <line x1="13" y1="51" x2="19" y2="45" />
        <line x1="45" y1="19" x2="51" y2="13" />
      </g>
    </template>

    <template v-else-if="state === 'clear' && period === 'night'">
      <path
        d="M44 12a18 18 0 1 0 14 26 14 14 0 0 1-14-26z"
        fill="#e6edff"
      />
      <circle cx="20" cy="14" r="1.4" fill="#ffffff" />
      <circle cx="12" cy="30" r="1.1" fill="#ffffff" />
      <circle cx="52" cy="50" r="1.4" fill="#ffffff" />
    </template>

    <template v-else-if="state === 'partly-cloudy' && period === 'day'">
      <circle cx="22" cy="24" r="9" fill="#ffd36b" />
      <path
        d="M18 44c0-6 5-10 11-10 5 0 9 3 10 8h1a8 8 0 0 1 0 16H18a7 7 0 0 1 0-14z"
        fill="#ffffff"
      />
    </template>

    <template v-else-if="state === 'partly-cloudy' && period === 'night'">
      <path
        d="M42 14a12 12 0 1 0 10 18 9 9 0 0 1-10-18z"
        fill="#e6edff"
      />
      <path
        d="M14 48c0-6 5-10 11-10 5 0 9 3 10 8h1a8 8 0 0 1 0 16H14a7 7 0 0 1 0-14z"
        fill="#b7c4df"
      />
    </template>

    <template v-else-if="state === 'cloudy'">
      <path
        d="M16 40c0-6 5-10 11-10 5 0 9 3 10 8h2a8 8 0 0 1 0 16H16a7 7 0 0 1 0-14z"
        fill="#e1e7f2"
      />
      <path
        d="M26 30c0-5 4-9 9-9 4 0 8 3 9 7h2a7 7 0 0 1 0 14H26a6 6 0 0 1 0-12z"
        fill="#ffffff"
        opacity="0.75"
      />
    </template>

    <template v-else-if="state === 'rain'">
      <path
        d="M14 36c0-6 5-10 11-10 5 0 9 3 10 8h2a8 8 0 0 1 0 16H14a7 7 0 0 1 0-14z"
        fill="#c7d0df"
      />
      <g stroke="#6cb5ff" stroke-width="3" stroke-linecap="round">
        <line x1="20" y1="48" x2="16" y2="58" />
        <line x1="32" y1="48" x2="28" y2="58" />
        <line x1="44" y1="48" x2="40" y2="58" />
      </g>
    </template>

    <template v-else-if="state === 'snow'">
      <path
        d="M14 32c0-6 5-10 11-10 5 0 9 3 10 8h2a8 8 0 0 1 0 16H14a7 7 0 0 1 0-14z"
        fill="#dce6f5"
      />
      <g fill="#ffffff">
        <circle cx="20" cy="52" r="2" />
        <circle cx="32" cy="56" r="2" />
        <circle cx="44" cy="52" r="2" />
      </g>
    </template>

    <template v-else-if="state === 'storm'">
      <path
        d="M14 32c0-6 5-10 11-10 5 0 9 3 10 8h2a8 8 0 0 1 0 16H14a7 7 0 0 1 0-14z"
        fill="#8994aa"
      />
      <path d="M32 44l-6 10h6l-3 10 9-14h-6l4-6z" fill="#ffd36b" />
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { VisualCondition } from "@/domain/types";

const props = defineProps<{
  condition: VisualCondition;
  label?: string;
}>();

const state = computed(() => props.condition.state);
const period = computed(() => props.condition.period);
const ariaLabel = computed(() => props.label ?? state.value);
</script>

<style scoped>
.weather-icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  color: inherit;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.28));
}
</style>
