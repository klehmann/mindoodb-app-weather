import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";
import vue from "@vitejs/plugin-vue";
import wasm from "vite-plugin-wasm";

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
    aliases["mindoodb-app-sdk"] = fileURLToPath(new URL("../mindoodb-app-sdk/src/index.ts", import.meta.url));
    aliases["mindoodb-view-language"] = fileURLToPath(new URL("../mindoodb-view-language/src/index.ts", import.meta.url));
  }

  return aliases;
}

export default defineConfig({
  plugins: [wasm(), vue()],
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
