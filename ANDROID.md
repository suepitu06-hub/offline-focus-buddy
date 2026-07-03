# Android / Google Play Setup

This project is wired up with Capacitor. The `android/` folder is generated locally on your machine (it is not committed and cannot be produced inside the Lovable sandbox because it needs the Android SDK).

## Why there are two builds

The default `npm run build` targets **Cloudflare Workers** (SSR via TanStack Start + Nitro). It emits `dist/client/` (assets only, no `index.html`) and `dist/server/` (Worker code). Capacitor needs a **plain static SPA** with a real `index.html`, so this repo ships a second config, `vite.mobile.config.ts`, that emits one into `dist-mobile/`.

That's the folder Capacitor is pointed at (`webDir: "dist-mobile"` in `capacitor.config.ts`). Capacitor runs from a `file://` origin inside a WebView, so the SPA uses `createMemoryHistory` and `base: "./"` — routing works entirely in memory, no server required.

## One-time setup on your computer

Prerequisites:
- Node.js 18+
- Android Studio (with Android SDK, Platform-Tools, and a JDK 17)
- Java `JAVA_HOME` pointing at JDK 17

After cloning / pulling the repo:

```bash
npm install
npm run build:mobile     # produces dist-mobile/ (static SPA with index.html)
npx cap add android      # creates the android/ native project
npx cap sync android
npx cap open android     # opens Android Studio
```

## Every time you change web code

```bash
npm run build:mobile
npx cap sync android
```

Or use the shortcut:

```bash
npm run android          # build:mobile + sync + open Android Studio
```

## App identity

Configured in `capacitor.config.ts`:
- **appId**: `com.screentimemanagement.app`
- **appName**: `Screen Time Management`
- **webDir**: `dist-mobile`

If you change `appId` later, delete the `android/` folder and run `npx cap add android` again.

## Icons & splash screen

Put a 1024x1024 PNG at `resources/icon.png` and a 2732x2732 PNG at `resources/splash.png`, then:

```bash
npm i -D @capacitor/assets
npx capacitor-assets generate --android
```

## Building a release AAB for Google Play

1. In Android Studio: **Build → Generate Signed Bundle / APK → Android App Bundle**.
2. Create a keystore the first time (keep the `.jks` file and passwords safe — you need them for every future update).
3. Choose **release** build variant. The signed `.aab` is written to `android/app/release/`.
4. Upload the `.aab` in the [Google Play Console](https://play.google.com/console) under your app → **Production → Create new release**.

## Play Store listing checklist

- App name, short description (≤80 chars), full description (≤4000 chars)
- Feature graphic 1024x500 PNG/JPG
- App icon 512x512 PNG
- At least 2 phone screenshots (min 320px, max 3840px)
- Privacy policy URL (required — the app stores data locally via IndexedDB; state that in the policy)
- Content rating questionnaire
- Data safety form (declare: data is stored on-device only, no data collected/shared)
- Target API level: Android 14 (API 34) or newer

## Version bumps

Edit `android/app/build.gradle`:
- `versionCode` — integer, must increase every upload
- `versionName` — user-visible string, e.g. `"1.0.1"`
