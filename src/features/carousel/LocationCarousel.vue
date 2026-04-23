<!--
  Swiper-backed horizontal carousel of location tiles. `slidesPerView`
  reacts to the Haven viewport so the carousel shows one card on
  narrow tiles, two on mid-sized ones, and 3-4 on wide ones.

  The wrapper owns the active slide index -- it is surfaced through
  `v-model:active-index` so the full-bleed background layer can
  cross-fade in sync.
-->
<template>
  <div class="carousel">
    <swiper
      :modules="modules"
      :slides-per-view="slidesPerView"
      :space-between="12"
      :pagination="pagination"
      :breakpoints="undefined"
      :centered-slides="false"
      :grab-cursor="true"
      :keyboard="{ enabled: true }"
      class="carousel__swiper"
      @swiper="onSwiper"
      @active-index-change="onActiveIndexChange"
    >
      <swiper-slide v-for="(tile, index) in tiles" :key="tile.query + ':' + index" class="carousel__slide">
        <slot :tile="tile" :index="index" />
      </swiper-slide>
    </swiper>

    <div v-if="showDots" ref="dotsRef" class="carousel__dots" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Keyboard, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import type { Swiper as SwiperInstance } from "swiper";

import type { LocationTile } from "@/app/useWeatherApp";
// @ts-expect-error - Swiper CSS side-effect imports have no type declarations
import "swiper/css";
// @ts-expect-error - Swiper CSS side-effect imports have no type declarations
import "swiper/css/pagination";

const props = defineProps<{
  tiles: LocationTile[];
  viewportWidth: number | null;
}>();

const emit = defineEmits<{
  (e: "update:activeIndex", index: number): void;
}>();

const modules = [Pagination, Keyboard];

const dotsRef = ref<HTMLElement | null>(null);

const slidesPerView = computed<number>(() => {
  const width = props.viewportWidth ?? 0;
  if (width >= 1400) {
    return Math.min(props.tiles.length, 4);
  }
  if (width >= 1000) {
    return Math.min(props.tiles.length, 3);
  }
  if (width >= 640) {
    return Math.min(props.tiles.length, 2);
  }
  return 1;
});

const showDots = computed(() => props.tiles.length > slidesPerView.value);

const pagination = computed(() => {
  if (!showDots.value) {
    return false as const;
  }
  return {
    el: dotsRef.value,
    clickable: true,
  };
});

let instance: SwiperInstance | null = null;

function onSwiper(swiper: SwiperInstance) {
  instance = swiper;
}

function onActiveIndexChange(swiper: SwiperInstance) {
  emit("update:activeIndex", swiper.activeIndex);
}

watch(slidesPerView, (value) => {
  if (instance) {
    instance.params.slidesPerView = value;
    instance.update();
  }
});
</script>

<style scoped>
.carousel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1 1 auto;
  min-height: 0;
}

.carousel__swiper {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.carousel__slide {
  height: auto;
  display: flex;
}

.carousel__dots {
  display: flex;
  justify-content: center;
  padding: 0 0 0.25rem;
}
</style>
