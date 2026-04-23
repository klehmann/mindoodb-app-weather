/**
 * English UI strings for the weather app.
 *
 * Keys are structured as `<section>.<key>` to keep lookup calls readable
 * and to allow grouped overrides in other locales.
 */
export default {
  app: {
    title: "Weather",
    emptyConfiguration: "No locations configured",
    emptyConfigurationHint:
      "Set the app’s “locations” launch parameter in Haven, e.g. “Berlin, Germany;Karlsruhe, Germany”.",
    reconnect: "Reconnect",
    offline: "Showing cached data",
  },
  loading: "Loading weather",
  error: {
    geocode: "Couldn’t find “{query}”",
    geocodeHint: "Try including the country, e.g. “Springfield, USA”.",
    forecast: "Couldn’t load the forecast for {name}",
    retry: "Retry",
  },
  current: {
    high: "H: {value}",
    low: "L: {value}",
    feelsLike: "Feels like",
    feelsLikeDelta: "vs actual {delta}",
    humidity: "Humidity",
    wind: "Wind",
    visibility: "Visibility",
    pressure: "Pressure",
    uvIndex: "UV Index",
    uvIndexMaxToday: "Today’s max {value}",
    sun: "Sunrise & Sunset",
    sunrise: "Sunrise",
    sunset: "Sunset",
    airQuality: "Air Quality",
    airQualityScaleEuropean: "European AQI",
    airQualityScaleUs: "US AQI",
  },
  hourly: {
    title: "Hourly forecast",
    now: "Now",
  },
  daily: {
    title: "10-Day forecast",
    today: "Today",
  },
  condition: {
    clearSky: "Clear",
    mainlyClear: "Mainly clear",
    partlyCloudy: "Partly cloudy",
    overcast: "Overcast",
    fog: "Fog",
    drizzle: "Drizzle",
    freezingDrizzle: "Freezing drizzle",
    rainLight: "Light rain",
    rain: "Rain",
    rainHeavy: "Heavy rain",
    freezingRain: "Freezing rain",
    snowLight: "Light snow",
    snow: "Snow",
    snowHeavy: "Heavy snow",
    snowGrains: "Snow grains",
    rainShowers: "Rain showers",
    rainShowersViolent: "Violent rain showers",
    snowShowers: "Snow showers",
    thunderstorm: "Thunderstorm",
    thunderstormHail: "Thunderstorm with hail",
    state: {
      clear: "Clear",
      "partly-cloudy": "Partly cloudy",
      cloudy: "Cloudy",
      rain: "Rain",
      snow: "Snow",
      storm: "Thunderstorm",
    },
  },
  uv: {
    band: {
      low: "Low",
      moderate: "Moderate",
      high: "High",
      veryHigh: "Very high",
      extreme: "Extreme",
    },
  },
  aqi: {
    band: {
      good: "Good",
      fair: "Fair",
      moderate: "Moderate",
      poor: "Poor",
      veryPoor: "Very poor",
      extremelyPoor: "Extremely poor",
      sensitive: "Unhealthy for sensitive",
      unhealthy: "Unhealthy",
      veryUnhealthy: "Very unhealthy",
      hazardous: "Hazardous",
    },
  },
  wind: {
    direction: {
      N: "N",
      NE: "NE",
      E: "E",
      SE: "SE",
      S: "S",
      SW: "SW",
      W: "W",
      NW: "NW",
    },
    fromDirection: "From {direction}",
  },
  pressure: {
    trend: {
      rising: "Rising",
      falling: "Falling",
      steady: "Steady",
    },
  },
};
