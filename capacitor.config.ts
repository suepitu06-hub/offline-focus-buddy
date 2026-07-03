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
};

export default config;
