import { useEffect } from "react";

/**
 * Android soft-keyboard awareness — deliberately minimal.
 *
 * With `Keyboard.resize: Native` (see capacitor.config.ts) the Android WebView
 * itself shrinks when the keyboard opens, so the layout is already correct and
 * NO JavaScript viewport measurement is needed. Measuring the viewport here is
 * what creates the classic Android freeze loop:
 *
 *   keyboard/viewport resize -> JS measures -> state/style write -> layout
 *   changes -> another resize -> ...
 *
 * So this hook does exactly one thing: toggle a `keyboard-open` class on
 * <body> from the native keyboard events (discrete, twice per keyboard cycle,
 * never per pixel). No React state, no re-render, no `resize` or
 * `visualViewport` listeners, no ResizeObserver.
 *
 * In a browser / Lovable Preview it is a complete no-op.
 */
export function useKeyboardInsets() {
  useEffect(() => {
    const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
    if (!cap?.isNativePlatform?.()) return;

    let cancelled = false;
    let removers: Array<() => void> = [];

    const setOpen = (open: boolean) => {
      // Idempotent: classList.toggle with an explicit force value does not
      // touch the DOM when the state already matches.
      if (document.body.classList.contains("keyboard-open") === open) return;
      document.body.classList.toggle("keyboard-open", open);
    };

    void (async () => {
      try {
        const { Keyboard } = await import("@capacitor/keyboard");
        if (cancelled) return;
        const show = await Keyboard.addListener("keyboardDidShow", () => setOpen(true));
        const hide = await Keyboard.addListener("keyboardDidHide", () => setOpen(false));
        if (cancelled) {
          void show.remove();
          void hide.remove();
          return;
        }
        removers = [() => void show.remove(), () => void hide.remove()];
      } catch {
        /* plugin unavailable — layout still works, nothing to do */
      }
    })();

    return () => {
      cancelled = true;
      removers.forEach((fn) => fn());
      document.body.classList.remove("keyboard-open");
    };
  }, []);
}
