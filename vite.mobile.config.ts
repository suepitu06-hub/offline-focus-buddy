// Standalone SPA build used to package the app with Capacitor.
// Unlike the default TanStack Start build (which emits a Cloudflare Worker),
// this produces a plain static site with a real index.html that Capacitor
// can copy into the native Android/iOS project.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  root: path.resolve(__dirname, "mobile"),
  base: "./", // required for Capacitor (file:// origin)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist-mobile"),
    emptyOutDir: true,
    target: "es2020",
  },
});
