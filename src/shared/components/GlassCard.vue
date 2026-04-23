<!--
  Reusable "frosted glass" surface, mirroring the translucent blocks in
  the iOS Weather app. Most of the card styling lives here so the
  individual sections (hourly, daily, info tiles) don't have to repeat
  the border + blur + shadow cocktail.
-->
<template>
  <section class="glass-card" :class="{ 'glass-card--strong': strong }">
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  strong?: boolean;
}>();
</script>

<style scoped>
.glass-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
