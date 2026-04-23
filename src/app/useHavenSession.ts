/**
 * Thin composable that owns the MindooDB Haven bridge lifecycle and exposes
 * the subset of launch context the weather app actually consumes: launch
 * parameters and the live viewport.
 *
 * This app deliberately has a single visual treatment (iOS Weather parity),
 * so `ctx.theme` and `onThemeChange` are intentionally ignored by the UI.
 * The SDK hook still runs so that the Running Apps drawer and other Haven
 * surfaces keep behaving normally; it simply does not feed the stylesheet.
 *
 * In standalone mode (not launched by Haven) the bridge connect call
 * rejects. The composable surfaces that as an error and falls back to
 * safe defaults so the app remains interactive against the public Open-Meteo
 * APIs -- useful for local development outside of Haven.
 *
 * @module useHavenSession
 */
import { onBeforeUnmount, ref, shallowRef } from "vue";
import {
  createMindooDBAppBridge,
  type MindooDBAppLaunchContext,
  type MindooDBAppSession,
  type MindooDBAppViewport,
} from "mindoodb-app-sdk";

export interface UseHavenSessionOptions {
  /**
   * Optional initial viewport used before the SDK reports one. Defaults to
   * the current `window.innerWidth` / `window.innerHeight` so the app has
   * something reasonable when run outside Haven.
   */
  initialViewport?: MindooDBAppViewport | null;
}

export interface HavenSessionState {
  /** Active SDK session once connected, or `null` otherwise. */
  session: ReturnType<typeof shallowRef<MindooDBAppSession | null>>;
  /** Launch context snapshot captured at connect time. */
  launchContext: ReturnType<typeof shallowRef<MindooDBAppLaunchContext | null>>;
  /** Live viewport. Updated by `onViewportChange` events. */
  viewport: ReturnType<typeof ref<MindooDBAppViewport | null>>;
  /** `true` while `connect()` is in flight. */
  connecting: ReturnType<typeof ref<boolean>>;
  /** Human-readable error message from the last failed connect attempt. */
  connectError: ReturnType<typeof ref<string | null>>;
  /**
   * `true` when the bridge handshake succeeded; `false` when we are running
   * standalone (local dev server, outside Haven). UI can use this flag to
   * hide Haven-specific affordances.
   */
  isHosted: ReturnType<typeof ref<boolean>>;
  /** Launch parameters from Haven (raw strings, key -> value). */
  launchParameters: ReturnType<typeof ref<Record<string, string>>>;
  /** Establish the bridge, read launch context, subscribe to viewport events. */
  connect: () => Promise<void>;
  /** Unsubscribe, dispose, and disconnect the session. */
  disconnect: () => Promise<void>;
}

function readBrowserViewport(): MindooDBAppViewport | null {
  if (typeof window === "undefined") {
    return null;
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export function useHavenSession(options: UseHavenSessionOptions = {}): HavenSessionState {
  const session = shallowRef<MindooDBAppSession | null>(null);
  const launchContext = shallowRef<MindooDBAppLaunchContext | null>(null);
  const viewport = ref<MindooDBAppViewport | null>(options.initialViewport ?? readBrowserViewport());
  const connecting = ref(false);
  const connectError = ref<string | null>(null);
  const isHosted = ref(false);
  const launchParameters = ref<Record<string, string>>({});

  let unsubscribeViewport: (() => void) | null = null;
  let browserResizeListener: (() => void) | null = null;

  function attachBrowserResizeFallback() {
    if (typeof window === "undefined" || browserResizeListener) {
      return;
    }
    const listener = () => {
      viewport.value = readBrowserViewport();
    };
    window.addEventListener("resize", listener);
    browserResizeListener = () => window.removeEventListener("resize", listener);
  }

  function detachBrowserResizeFallback() {
    browserResizeListener?.();
    browserResizeListener = null;
  }

  async function connect() {
    if (connecting.value) {
      return;
    }
    connecting.value = true;
    connectError.value = null;
    try {
      const bridge = createMindooDBAppBridge();
      const nextSession = await bridge.connect();
      session.value = nextSession;

      const ctx = await nextSession.getLaunchContext();
      launchContext.value = ctx;
      launchParameters.value = ctx.launchParameters ?? {};
      viewport.value = ctx.viewport ?? readBrowserViewport();
      isHosted.value = true;

      // NB: intentionally ignoring ctx.theme / onThemeChange. See module docs.
      unsubscribeViewport = nextSession.onViewportChange((next) => {
        viewport.value = next;
      });

      detachBrowserResizeFallback();
    } catch (error) {
      isHosted.value = false;
      connectError.value =
        error instanceof Error
          ? error.message
          : "Failed to connect to Haven. The app falls back to browser-only mode.";
      attachBrowserResizeFallback();
    } finally {
      connecting.value = false;
    }
  }

  async function disconnect() {
    unsubscribeViewport?.();
    unsubscribeViewport = null;
    detachBrowserResizeFallback();

    const current = session.value;
    session.value = null;
    if (!current) {
      return;
    }
    try {
      await current.disconnect();
    } catch {
      // Best-effort teardown: Haven may already be gone.
    }
  }

  onBeforeUnmount(() => {
    void disconnect();
  });

  return {
    session,
    launchContext,
    viewport,
    connecting,
    connectError,
    isHosted,
    launchParameters,
    connect,
    disconnect,
  };
}
