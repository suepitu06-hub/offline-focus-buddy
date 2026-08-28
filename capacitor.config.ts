import type { CapacitorConfig } from "@capacitor/cli";

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
      resize: "native" as never,
      resizeOnFullScreen: true,
    },
  },
};

export default config;
