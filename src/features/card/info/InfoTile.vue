<!--
  Shared shell for an info-grid tile. Matches the iOS Weather info
  cards: small caps label, prominent value, optional secondary line.
-->
<template>
  <section class="info-tile glass-card">
    <header class="info-tile__header">
      <span class="info-tile__icon" aria-hidden="true"><slot name="icon" /></span>
      <span class="info-tile__label">{{ label }}</span>
    </header>
    <div class="info-tile__value"><slot /></div>
    <footer v-if="$slots.footer" class="info-tile__footer"><slot name="footer" /></footer>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  label: string;
}>();
</script>

<style scoped>
.info-tile {
  min-height: 8.5rem;
  padding: 0.85rem 1rem;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 0.35rem;
}

.info-tile__header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-soft);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.info-tile__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 0.9rem;
  height: 0.9rem;
  opacity: 0.75;
}

.info-tile__label {
  opacity: 0.8;
}

.info-tile__value {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-size: 1.6rem;
  font-weight: 300;
  line-height: 1.1;
}

.info-tile__footer {
  color: var(--text-muted);
  font-size: 0.8rem;
  line-height: 1.2;
}
</style>
