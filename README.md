# Web Server PHP/MyAdmin/MySQL APK

The Web Server PHP/MyAdmin/MySQL APK is a lightweight, automatic-installation web server for Android devices. It is pre-configured, uses low memory, can serve simultaneous requests, does not require root access, is free of charge, and contains no advertisements.

Compatibility target:
- Android API levels 9 (GINGERBREAD) through 25 (NOUGAT)
- Designed to also run on devices with API levels above 25

## GitHub Clone

```bash
git clone https://github.com/ArkansasIo/webserver-apk.git
cd webserver-apk
```

# Mobile API Backend (Android/iOS)

This workspace provides a ready backend for mobile apps without a proprietary dev kit.

Included stacks:
- TypeScript REST API (`ts-api`) using Express
- PHP REST API (`php-api`) using Apache + PDO
- MySQL database with init script (`database/init.sql`)
- Web UI GUI app (`web-ui`) with main menus, submenus, options, and settings
- Docker Compose for one-command local setup

## Quick Start

1. Copy env defaults:

```bash
copy .env.example .env
```

2. Start all services:

```bash
docker compose up --build -d
```

3. Test endpoints:

Web UI:
- `http://localhost:5173`

TypeScript API:
- `GET http://localhost:3000/health`
- `GET http://localhost:3000/users`
- `POST http://localhost:3000/auth/login`

PHP API:
- `GET http://localhost:8080/health`
- `GET http://localhost:8080/users`
- `POST http://localhost:8080/auth/login`

Sample login payload:

```json
{
  "email": "demo@example.com",
  "password": "demo123"
}
```

## Notes for Android/iOS

- Use either API base URL in your app:
  - TypeScript: `http://<server-ip>:3000`
  - PHP: `http://<server-ip>:8080`
- For emulators/simulators, use the host mapping appropriate to your platform.
- Current auth token is a development token format for MVP testing.

## GUI Menus

- Main Menu: Dashboard, Users, Auth, Options, Settings
- Sub Menus:
  - Dashboard → Service Health (TS/PHP checks)
  - Users → User List, Create User
  - Auth → Login
  - Options → API Source, Pretty JSON
  - Settings → TypeScript/PHP endpoint URLs

## Android APK

Android wrapper project location:
- `android-app`

Wrapper bootstrap (only needed once, if `gradle-wrapper.jar` is missing):

```bash
gradle -p android-app wrapper --gradle-version 8.10.2
```

This generates `android-app/gradle/wrapper/gradle-wrapper.jar`.

Build debug APK:

```bash
android-app\\gradlew.bat -p android-app assembleDebug
```

Build release APK:

```bash
android-app\\gradlew.bat -p android-app assembleRelease
```

Build signed release APK:

1. Create your release keystore.
2. Copy `android-app/keystore.properties.example` to `android-app/keystore.properties` and fill values.
3. Run:

```bash
android-app\\gradlew.bat -p android-app assembleRelease
```

Set app URL at build time (example for local network host):

```bash
android-app\\gradlew.bat -p android-app assembleDebug -PwebAppUrl=http://192.168.1.50:5173
```

APK output paths:
- `android-app/app/build/outputs/apk/debug/app-debug.apk`
- `android-app/app/build/outputs/apk/release/app-release-unsigned.apk` (without signing config)
- `android-app/app/build/outputs/apk/release/app-release.apk` (with signing config)

Full webserver + APK (one command, Windows):

```bash
build-full-apk.bat
```

This command:
- Starts MySQL + TypeScript API + PHP API + Web UI (`docker compose up --build -d`)
- Bootstraps Gradle wrapper automatically when `gradle-wrapper.jar` is missing
- Builds Android release APK (`assembleRelease`)
- Prints the produced APK path (signed or unsigned)
- Copies final APK to top-level `output` folder:
  - `output/webserver-release.apk` (signed)
  - `output/webserver-release-unsigned.apk` (unsigned)

Notes:
- Default URL in app is `http://10.0.2.2:5173` (Android emulator host mapping).
- For a physical phone, build with `-PwebAppUrl=http://<your-lan-ip>:5173`.
- If `gradle-wrapper.jar` is not present yet, `gradlew.bat` falls back to system `gradle`.
- For fully self-contained builds, run wrapper bootstrap once and keep wrapper files in the project.

## GitHub Actions APK CI

Workflow file:
- `.github/workflows/android-apk.yml`

What it builds:
- Debug APK on every push/PR
- Signed release APK when signing secrets are configured

Required repository secrets for signed release:
- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_STORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Generate base64 keystore value (Windows PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("android-app\release-key.jks"))
```

Artifact names in Actions:
- `app-debug-apk`
- `app-release-apk`

## Dev Commands

Rebuild services:

```bash
docker compose up --build -d
```

View logs:

```bash
docker compose logs -f ts-api php-api mysql
```

Stop services:

```bash
docker compose down
```

## Git Push Quick Steps

From project root (`d:\webserver`):

```bash
git init
git add .
git commit -m "Initial webserver APK + API + CI setup"
git branch -M main
git remote add origin https://github.com/ArkansasIo/webserver-apk.git
git push -u origin main
```

If remote already has commits:

```bash
git pull --rebase origin main
git push -u origin main
```
