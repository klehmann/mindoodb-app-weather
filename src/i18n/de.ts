/**
 * Deutsche UI-Texte für die Wetter-App.
 *
 * Schlüssel sind identisch mit `en.ts`, damit ein einfacher Fallback auf
 * Englisch möglich bleibt, falls ein Eintrag fehlen sollte.
 */
export default {
  app: {
    title: "Wetter",
    emptyConfiguration: "Keine Orte konfiguriert",
    emptyConfigurationHint:
      "Bitte den App-Parameter „locations“ in Haven setzen, z. B. „Berlin, Deutschland;Karlsruhe, Deutschland“.",
    reconnect: "Neu verbinden",
    offline: "Zwischengespeicherte Daten",
  },
  loading: "Wetter wird geladen",
  error: {
    geocode: "„{query}“ konnte nicht gefunden werden",
    geocodeHint: "Bitte das Land angeben, z. B. „Berlin, Deutschland“.",
    forecast: "Wetter für {name} konnte nicht geladen werden",
    retry: "Erneut versuchen",
  },
  current: {
    high: "H: {value}",
    low: "T: {value}",
    feelsLike: "Gefühlt",
    feelsLikeDelta: "ggü. tatsächlich {delta}",
    humidity: "Luftfeuchte",
    wind: "Wind",
    visibility: "Sicht",
    pressure: "Luftdruck",
    uvIndex: "UV-Index",
    uvIndexMaxToday: "Heutiges Maximum {value}",
    sun: "Sonnenauf- & -untergang",
    sunrise: "Sonnenaufgang",
    sunset: "Sonnenuntergang",
    airQuality: "Luftqualität",
    airQualityScaleEuropean: "Europäischer AQI",
    airQualityScaleUs: "US-AQI",
  },
  hourly: {
    title: "Stündliche Vorhersage",
    now: "Jetzt",
  },
  daily: {
    title: "10-Tage-Vorhersage",
    today: "Heute",
  },
  condition: {
    clearSky: "Klar",
    mainlyClear: "Überwiegend klar",
    partlyCloudy: "Teilweise bewölkt",
    overcast: "Bedeckt",
    fog: "Nebel",
    drizzle: "Nieselregen",
    freezingDrizzle: "Gefrierender Nieselregen",
    rainLight: "Leichter Regen",
    rain: "Regen",
    rainHeavy: "Starker Regen",
    freezingRain: "Gefrierender Regen",
    snowLight: "Leichter Schneefall",
    snow: "Schneefall",
    snowHeavy: "Starker Schneefall",
    snowGrains: "Schneegriesel",
    rainShowers: "Regenschauer",
    rainShowersViolent: "Heftige Regenschauer",
    snowShowers: "Schneeschauer",
    thunderstorm: "Gewitter",
    thunderstormHail: "Gewitter mit Hagel",
    state: {
      clear: "Klar",
      "partly-cloudy": "Teilweise bewölkt",
      cloudy: "Bewölkt",
      rain: "Regen",
      snow: "Schnee",
      storm: "Gewitter",
    },
  },
  uv: {
    band: {
      low: "Niedrig",
      moderate: "Mäßig",
      high: "Hoch",
      veryHigh: "Sehr hoch",
      extreme: "Extrem",
    },
  },
  aqi: {
    band: {
      good: "Gut",
      fair: "Zufriedenstellend",
      moderate: "Mittelmäßig",
      poor: "Schlecht",
      veryPoor: "Sehr schlecht",
      extremelyPoor: "Extrem schlecht",
      sensitive: "Ungesund für Empfindliche",
      unhealthy: "Ungesund",
      veryUnhealthy: "Sehr ungesund",
      hazardous: "Gefährlich",
    },
  },
  wind: {
    direction: {
      N: "N",
      NE: "NO",
      E: "O",
      SE: "SO",
      S: "S",
      SW: "SW",
      W: "W",
      NW: "NW",
    },
    fromDirection: "Aus {direction}",
  },
  pressure: {
    trend: {
      rising: "Steigend",
      falling: "Fallend",
      steady: "Gleichbleibend",
    },
  },
};
