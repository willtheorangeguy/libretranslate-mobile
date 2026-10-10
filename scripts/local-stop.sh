#!/bin/bash
set -euo pipefail
source "$(dirname "$0")/local-env.sh"
for service in server metro; do
  pid_file="$LIBRETRANSLATE_ROOT/.local/$service.pid"
  if [ -f "$pid_file" ]; then
    pid="$(cat "$pid_file")"
    command_line="$(ps -p "$pid" -o command= 2>/dev/null || true)"
    case "$command_line" in
      *"$LIBRETRANSLATE_ROOT"*) kill "$pid" 2>/dev/null || true ;;
    esac
    rm -f "$pid_file"
  fi
done
if command -v adb >/dev/null && adb -s emulator-5560 emu avd name 2>/dev/null | grep -qx LibreTranslate_Local; then
  adb -s emulator-5560 emu kill
fi
echo 'Local test services stopped.'
