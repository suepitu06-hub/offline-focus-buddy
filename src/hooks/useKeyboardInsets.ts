import { useEffect } from "react";

/**
 * Tracks the on-screen keyboard height and exposes it to CSS as `--kb-inset`,
 * plus a `keyboard-open` class on <body>.
 *
 * - Inside the Capacitor Android WebView we use the official @capacitor/keyboard
 *   plugin events (reliable, no polling).
 * - In a normal browser / Lovable Preview we fall back to visualViewport, which
 *   is a no-op on desktop (inset stays 0), so web behavior is unchanged.
 *
 * Listeners are attached once at the app root and cleaned up on unmount, so no
 * component state, forms, or database queries are ever re-created.
 */
export function useKeyboardInsets() {
  useEffect(() => {
    const root = document.documentElement;
    let current = -1;

    const apply = (height: number) => {
      const px = Math.max(0, Math.round(height));
      if (px === current) return;
      current = px;
      root.style.setProperty("--kb-inset", `${px}px`);
      document.body.classList.toggle("keyboard-open", px > 80);
    };

    apply(0);

    const cleanups: Array<() => void> = [];
    let cancelled = false;

    const isNative =
      typeof window !== "undefined" &&
      Boolean((window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.());

    if (isNative) {
      void (async () => {
        try {
          const { Keyboard } = await import("@capacitor/keyboard");
          if (cancelled) return;
          const show = await Keyboard.addListener("keyboardWillShow", (info) =>
            apply(info.keyboardHeight),
          );
          const hide = await Keyboard.addListener("keyboardWillHide", () => apply(0));
          cleanups.push(() => void show.remove(), () => void hide.remove());
        } catch {
          /* plugin unavailable — fall back to visualViewport below */
        }
      })();
    }

    const vv = window.visualViewport;
    if (vv) {
      const onResize = () => {
        if (isNative && current > 0) return; // plugin is authoritative on native
        apply(window.innerHeight - vv.height - vv.offsetTop);
      };
      vv.addEventListener("resize", onResize);
      vv.addEventListener("scroll", onResize);
      cleanups.push(() => {
        vv.removeEventListener("resize", onResize);
        vv.removeEventListener("scroll", onResize);
      });
    }

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
      root.style.removeProperty("--kb-inset");
      document.body.classList.remove("keyboard-open");
    };
  }, []);
}
