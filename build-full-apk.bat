@echo off
setlocal

set OUTPUT_DIR=output
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

echo [1/4] Starting web server stack with Docker Compose...
docker compose up --build -d
if errorlevel 1 (
  echo Docker Compose failed.
  exit /b 1
)

if not exist "android-app\gradle\wrapper\gradle-wrapper.jar" (
  echo [2/4] Gradle wrapper JAR not found. Bootstrapping wrapper...
  gradle -p android-app wrapper --gradle-version 8.10.2
  if errorlevel 1 (
    echo Gradle wrapper bootstrap failed.
    exit /b 1
  )
) else (
  echo [2/4] Gradle wrapper JAR found.
)

echo [3/4] Building Android release APK...
android-app\gradlew.bat -p android-app assembleRelease
if errorlevel 1 (
  echo Android APK build failed.
  exit /b 1
)

echo [4/4] Done.
if exist "android-app\app\build\outputs\apk\release\app-release.apk" (
  copy /Y "android-app\app\build\outputs\apk\release\app-release.apk" "%OUTPUT_DIR%\webserver-release.apk" >nul
  echo Signed APK path:
  echo android-app\app\build\outputs\apk\release\app-release.apk
  echo Copied to:
  echo %OUTPUT_DIR%\webserver-release.apk
) else (
  copy /Y "android-app\app\build\outputs\apk\release\app-release-unsigned.apk" "%OUTPUT_DIR%\webserver-release-unsigned.apk" >nul
  echo Unsigned APK path:
  echo android-app\app\build\outputs\apk\release\app-release-unsigned.apk
  echo Copied to:
  echo %OUTPUT_DIR%\webserver-release-unsigned.apk
)

endlocal
