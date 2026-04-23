/**
 * Entry point: wire up vue-i18n and mount the app.
 *
 * The global stylesheet `shared/styles/main.css` is imported here so
 * the CSS custom properties are available before any component mounts.
 * We import `weather.css` immediately after for the glass-card helpers
 * and pagination overrides.
 */
import { createApp } from "vue";

import App from "./App.vue";
import { createAppI18n } from "./i18n";
import "./shared/styles/main.css";
import "./shared/styles/weather.css";

const app = createApp(App);
app.use(createAppI18n());
app.mount("#app");
