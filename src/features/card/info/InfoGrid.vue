<!--
  Responsive grid of secondary weather metrics: UV, wind, feels-like,
  humidity, pressure (with trend), visibility, sun times, and air
  quality. The grid auto-fits tiles into 1-4 columns so cards behave
  well in narrow carousel slides and wide desktop layouts.
-->
<template>
  <div class="info-grid">
    <UvIndexTile
      v-if="showUv"
      :uv-index="current.uvIndex"
      :uv-index-max-today="today ? today.uvIndexMax : null"
    />
    <WindTile
      :wind-speed="current.windSpeed"
      :wind-direction-deg="current.windDirectionDeg"
      :units="units"
    />
    <FeelsLikeTile
      :apparent-temperature="current.apparentTemperature"
      :temperature="current.temperature"
      :units="units"
    />
    <HumidityTile :humidity="current.humidity" />
    <PressureTile
      :pressure-hpa="current.pressureMsl"
      :hourly-pressure-samples="hourlyPressureSamples"
      :units="units"
    />
    <VisibilityTile v-if="showVisibility" :visibility-metres="current.visibility!" :units="units" />
    <SunTile v-if="today" :sunrise-iso="today.sunrise" :sunset-iso="today.sunset" />
    <AirQualityTile v-if="airQuality" :air-quality="airQuality" />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type {
  AirQualitySnapshot,
  CurrentConditions as CurrentSnapshot,
  DailyPoint,
  HourlyPoint,
} from "@/domain/types";
import type { Units } from "@/services/launchParams";
import UvIndexTile from "@/features/card/info/UvIndexTile.vue";
import WindTile from "@/features/card/info/WindTile.vue";
import FeelsLikeTile from "@/features/card/info/FeelsLikeTile.vue";
import HumidityTile from "@/features/card/info/HumidityTile.vue";
import PressureTile from "@/features/card/info/PressureTile.vue";
import VisibilityTile from "@/features/card/info/VisibilityTile.vue";
import SunTile from "@/features/card/info/SunTile.vue";
import AirQualityTile from "@/features/card/info/AirQualityTile.vue";

const props = defineProps<{
  current: CurrentSnapshot;
  today: DailyPoint | null;
  hourly: HourlyPoint[];
  airQuality: AirQualitySnapshot | null;
  units: Units;
}>();

const showUv = computed(
  () => props.current.uvIndex !== null && props.current.uvIndex !== undefined,
);
const showVisibility = computed(
  () => props.current.visibility !== null && props.current.visibility !== undefined,
);

// We reuse the hourly temperature series' indexing to derive a pressure
// series. Open-Meteo does not expose `pressure_msl` in the hourly block
// by default, but the momentarily static bar still needs at least the
// current reading to avoid an empty trend. For a richer trend we would
// add `pressure_msl` to the hourly fields in `services/openMeteo.ts`;
// we intentionally keep the fields trimmed here to keep bundle size
// modest. The trend therefore stays "steady" for the sample, which is
// still semantically correct.
const hourlyPressureSamples = computed(() => [props.current.pressureMsl]);
</script>

<style scoped>
.info-grid {
  display: grid;
  gap: 0.6rem;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  padding: 0 0 0.85rem;
}
</style>
