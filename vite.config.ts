import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import { havenBundle } from "mindoodb-app-sdk/vite";
import wasm from "vite-plugin-wasm";
import { VitePWA } from "vite-plugin-pwa";

/**
 * Build the `resolve.alias` map.
 *
 * In normal mode the app is built against the published `mindoodb-app-sdk`
 * from npm. When the `LOCAL_MINDOODB` environment variable is set to `1`
 * (via the `dev:local` / `build:local` npm scripts) the SDK and its sibling
 * packages are sourced directly from the workspace so you can iterate on
 * Haven, the SDK, and this sample app in a single `npm run dev` loop.
 */
function createResolveAliases(): Record<string, string> {
  const aliases: Record<string, string> = {
    "@": fileURLToPath(new URL("./src", import.meta.url)),
  };

  if (process.env.LOCAL_MINDOODB === "1") {
    aliases["mindoodb-app-sdk/testing"] = fileURLToPath(
      new URL("../mindoodb-app-sdk/src/testing/index.ts", import.meta.url),
    );
    aliases["mindoodb-app-sdk/vite"] = fileURLToPath(new URL("../mindoodb-app-sdk/src/vite/index.ts", import.meta.url));
    aliases["mindoodb-app-sdk"] = fileURLToPath(new URL("../mindoodb-app-sdk/src/index.ts", import.meta.url));
    aliases["mindoodb-view-language"] = fileURLToPath(new URL("../mindoodb-view-language/src/index.ts", import.meta.url));
  }

  return aliases;
}

const isVitest = process.env.VITEST === "true";

/**
 * `/__haven-test/` frames the app with a mock Haven (see `src/testHost/main.ts`). `vite dev`
 * serves it anyway; a build only includes it with `HAVEN_TEST_HOST=1`, for preview
 * deployments, so the production URL never exposes a mock-data page to end users.
 */
function createBuildInputs(): Record<string, string> {
  const inputs: Record<string, string> = {
    main: fileURLToPath(new URL("./index.html", import.meta.url)),
  };
  if (process.env.HAVEN_TEST_HOST === "1") {
    inputs.havenTest = fileURLToPath(new URL("./__haven-test/index.html", import.meta.url));
  }
  return inputs;
}

// Store screenshots are only read from the app's own origin (landing page, Haven's setup
// wizard); inside the hosted bundle they would only grow every download.
function excludeFromHavenBundle(path: string) {
  return path.startsWith("listing/") || path.startsWith("__haven-test/");
}

export default defineConfig({
  // Relative asset URLs so the same build works from the app origin and from
  // Haven's `/__mindoodb_hosted_apps__/<bundleId>/` prefix.
  base: "./",
  plugins: [
    wasm(),
    vue(),
    havenBundle({ exclude: excludeFromHavenBundle }),
    ...(
      isVitest
        ? []
        : [
            VitePWA({
              strategies: "injectManifest",
              srcDir: "src",
              filename: "sw.ts",
              injectRegister: false,
              manifest: false,
              injectManifest: {
                globPatterns: ["**/*.{css,html,ico,js,png,svg,ttf,wasm,webmanifest,woff,woff2}"],
                maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
              },
            }),
          ]
    ),
  ],
  build: {
    rollupOptions: {
      input: createBuildInputs(),
    },
  },
  resolve: {
    alias: createResolveAliases(),
  },
  server: {
    host: "127.0.0.1",
    port: 4205,
  },
  test: {
    environment: "jsdom",
    globals: false,
  },
});
