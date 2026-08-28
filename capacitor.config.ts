import type { CapacitorConfig } from "@capacitor/cli";
import { KeyboardResize } from "@capacitor/keyboard";

const config: CapacitorConfig = {
  appId: "com.screentimemanagement.app",
  appName: "Screen Time Management",
  webDir: "dist-mobile",
  android: {
    allowMixedContent: false,
    backgroundColor: "#ffffff",
  },
  server: {
    androidScheme: "https",
  },
  plugins: {
    Keyboard: {
      // Resize the WebView itself so fixed/absolute layout math stays valid
      // while the Android soft keyboard is open.
      resize: KeyboardResize.Native,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
