<!--
  Lightweight "three dots" loading indicator used on tiles while we are
  waiting for data. Purely decorative, no live region.
-->
<template>
  <span class="loading-dots" role="presentation" aria-hidden="true">
    <span class="loading-dots__dot" />
    <span class="loading-dots__dot" />
    <span class="loading-dots__dot" />
  </span>
</template>

<style scoped>
.loading-dots {
  display: inline-flex;
  gap: 0.35rem;
}

.loading-dots__dot {
  width: 0.5rem;
  height: 0.5rem;
  background: currentColor;
  border-radius: 50%;
  opacity: 0.4;
  animation: loading-dot 1.2s ease-in-out infinite;
}

.loading-dots__dot:nth-child(2) {
  animation-delay: 0.15s;
}
.loading-dots__dot:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes loading-dot {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(0.85);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
