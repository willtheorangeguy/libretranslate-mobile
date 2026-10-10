#!/bin/bash
set -euo pipefail
source "$(dirname "$0")/local-env.sh"
cd "$LIBRETRANSLATE_ROOT"
mkdir -p .local
if ! command -v adb >/dev/null || ! command -v emulator >/dev/null || ! command -v java >/dev/null; then
  echo 'Android SDK and JDK are required. See docs/local-testing.md.' >&2
  exit 1
fi
AVD_NAME=LibreTranslate_Local
DEVICE=emulator-5560
if ! emulator -list-avds | grep -qx "$AVD_NAME"; then
  echo no | avdmanager create avd --name "$AVD_NAME" --package 'system-images;android-35;default;arm64-v8a' --device pixel_6
fi
if ! adb -s "$DEVICE" get-state >/dev/null 2>&1; then
  nohup emulator -avd "$AVD_NAME" -port 5560 -memory 2048 -cores 2 -no-snapshot-save > .local/emulator.log 2>&1 &
  echo $! > .local/emulator.pid
fi
if ! curl -fsS http://127.0.0.1:8081/status 2>/dev/null | grep -q 'packager-status:running'; then
  nohup node "$LIBRETRANSLATE_ROOT/node_modules/react-native/cli.js" start --host 127.0.0.1 > .local/metro.log 2>&1 &
  echo $! > .local/metro.pid
fi
if ! curl -fsS http://127.0.0.1:5001/languages >/dev/null 2>&1; then
  nohup bash scripts/local-server.sh > .local/server.log 2>&1 &
  echo $! > .local/server.pid
fi
adb -s "$DEVICE" wait-for-device
until [ "$(adb -s "$DEVICE" shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = 1 ]; do sleep 1; done
adb -s "$DEVICE" reverse tcp:8081 tcp:8081
adb -s "$DEVICE" reverse tcp:5001 tcp:5001
cd android
./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a --max-workers=2
cd ..
adb -s "$DEVICE" install -r android/app/build/outputs/apk/debug/app-debug.apk
adb -s "$DEVICE" shell am start -n com.libretranslateapp/.MainActivity
echo 'App launched. Choose Custom server: http://127.0.0.1:5001 (no API key).'
echo 'The first server start downloads English/Spanish models. Logs: .local/server.log'
