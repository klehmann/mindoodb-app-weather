/**
 * Periodically invoke a refresh callback while the app is mounted.
 *
 * When `intervalMinutes` is `0` or the tab is hidden, the timer is
 * paused. Switching back to the tab triggers an immediate refresh and
 * restarts the timer.
 *
 * @module app/useAutoRefresh
 */
import { onBeforeUnmount, watch, type Ref } from "vue";

export function useAutoRefresh(intervalMinutes: Ref<number>, refresh: () => void | Promise<void>) {
  let timer: ReturnType<typeof setInterval> | null = null;

  function clear() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  function arm() {
    clear();
    const minutes = intervalMinutes.value;
    if (!minutes || minutes <= 0) {
      return;
    }
    timer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      void refresh();
    }, minutes * 60_000);
  }

  function handleVisibilityChange() {
    if (typeof document === "undefined") {
      return;
    }
    if (document.visibilityState === "visible" && intervalMinutes.value > 0) {
      void refresh();
      arm();
    }
  }

  watch(intervalMinutes, arm, { immediate: true });

  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }

  onBeforeUnmount(() => {
    clear();
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  });
}
