<!--
  Placeholder tile shown when a location cannot be geocoded or a
  forecast cannot be fetched even with a warm cache. Echoes the
  offending input back to the user so they can fix the app parameter.
-->
<template>
  <article class="error-card">
    <div class="error-card__body glass-card glass-card--strong">
      <div class="error-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9" />
          <line x1="12" y1="8" x2="12" y2="13" />
          <circle cx="12" cy="16" r="1" fill="currentColor" />
        </svg>
      </div>
      <h2 class="error-card__title">{{ t("error.geocode", { query }) }}</h2>
      <p class="error-card__hint">{{ t("error.geocodeHint") }}</p>
      <p class="error-card__detail">{{ detail }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

defineProps<{
  query: string;
  detail: string;
}>();

const { t } = useI18n();
</script>

<style scoped>
.error-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  padding: 1rem;
  width: 100%;
  height: 100%;
}

.error-card__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1.5rem;
  text-align: center;
  color: var(--text);
}

.error-card__icon {
  width: 3rem;
  height: 3rem;
  color: #ffb497;
}

.error-card__icon svg {
  width: 100%;
  height: 100%;
}

.error-card__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.error-card__hint {
  margin: 0;
  color: var(--text-soft);
  font-size: 1rem;
  max-width: 28rem;
}

.error-card__detail {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  opacity: 0.7;
  word-break: break-word;
}
</style>
