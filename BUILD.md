# Build Android and iOS

Install dependencies with `npm ci`. Copy `.env.example` to `.env` and set the
Supabase URL and publishable key. Never use a Supabase service-role key in the app.

## Android APK on Windows

Install Android Studio, an Android SDK and JDK 21. Set `JAVA_HOME` and
`ANDROID_HOME` to those installations, then run:

```powershell
pwsh -File scripts/build-android.ps1
```

The script uses a short local CMake build directory under `%USERPROFILE%/.vku-build`
to avoid the Windows 260-character path limit, and copies the completed APK to
`artifacts/VKU-Study-Room-1.0.0.apk`.
After changing native dependencies or `app.json`, regenerate the native project
with `npx expo prebuild --platform android --no-install` before running the script.

The APK is at `android/app/build/outputs/apk/release/app-release.apk`.
Expo's generated release configuration uses the development signing key, so this
APK is suitable for direct installation and testing. Use EAS-managed release
credentials for store distribution.

## EAS cloud builds

Sign in with `npx eas-cli@latest login`, then link the project with
`npx eas-cli@latest init`. Configure `EXPO_PUBLIC_SUPABASE_URL` and
`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the EAS environment used by the build;
the local `.env` file is excluded from Git and is not uploaded by default.

```sh
# Installable Android APK
npx eas-cli@latest build --platform android --profile preview

# iOS Simulator build: requires Expo, does not require Apple Developer membership
npx eas-cli@latest build --platform ios --profile ios-simulator

# iPhone IPA: requires Apple Developer membership and registered device UDIDs
npx eas-cli@latest build --platform ios --profile preview

# Store builds: Android AAB / iOS IPA
npx eas-cli@latest build --platform all --profile production
```

An iOS Simulator artifact runs in the simulator on a Mac; it cannot be installed
on an iPhone. An ad hoc IPA runs only on devices included in its provisioning
profile. iOS cannot be compiled locally on Windows.

## Authentication configuration

Add `vku-study-room://auth/callback` to the Supabase Auth redirect allowlist for
installed Android/iOS builds. Enable the Google provider when using Google sign-in.
The SQL files in `supabase/` must be applied separately to the Supabase project;
pushing code and building the app do not apply database changes.

## Web on Vercel

```sh
npm run build:web
npx vercel@latest login
npx vercel@latest link --yes --project vku-study-room-booking
npx vercel@latest deploy --prod --yes
```

Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in the
Vercel project's build environments before deploying. `vercel.json` builds the
web app with npm and serves `dist`, including an SPA fallback for auth callbacks.
Add `https://<your-vercel-domain>/auth/callback` to the Supabase Auth redirect
allowlist for web Google sign-in and email confirmation.

Native booking reminder notifications are available in the Android/iOS app;
the web version does not schedule native notifications.
