<!--
  Full-bleed background layer. Two image layers cross-fade whenever the
  active visual condition changes, giving the app the characteristic
  smooth iOS Weather background transition.
-->
<template>
  <div class="weather-background" aria-hidden="true">
    <div
      class="weather-background__layer"
      :class="{ 'weather-background__layer--active': slot === 'a' }"
      :style="{ backgroundImage: bgA ? `url(${bgA})` : 'none' }"
    />
    <div
      class="weather-background__layer"
      :class="{ 'weather-background__layer--active': slot === 'b' }"
      :style="{ backgroundImage: bgB ? `url(${bgB})` : 'none' }"
    />
    <div class="weather-background__scrim" />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { VisualCondition } from "@/domain/types";

const props = defineProps<{
  condition: VisualCondition | null;
}>();

/**
 * Build the URL for a given condition key. We prefer pre-generated
 * photographic backgrounds under `/backgrounds/`; if no such file is
 * present (e.g. in a fresh checkout before the images have been
 * generated) the browser will just render the fallback gradient.
 */
function resolveUrl(condition: VisualCondition | null): string | null {
  if (!condition) {
    return null;
  }
  return `/backgrounds/${condition.key}.jpg`;
}

/**
 * Double-buffer the background: two layers (`a` and `b`) swap active
 * state so CSS can cross-fade their opacities. We keep the most recent
 * URL in `bgA`, the previous one in `bgB`, and flip the active slot.
 */
const bgA = ref<string | null>(resolveUrl(props.condition));
const bgB = ref<string | null>(null);
const slot = ref<"a" | "b">("a");

watch(
  () => props.condition?.key,
  () => {
    const url = resolveUrl(props.condition);
    if (slot.value === "a") {
      bgB.value = url;
      slot.value = "b";
    } else {
      bgA.value = url;
      slot.value = "a";
    }
  },
);
</script>
