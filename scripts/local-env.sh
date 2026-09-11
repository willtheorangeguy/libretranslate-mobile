#!/bin/bash
# Sourced by local development commands; keeps machine-specific paths out of git.
LIBRETRANSLATE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
if [ -d "$LIBRETRANSLATE_ROOT/.local/jdk/Contents/Home" ]; then
  export JAVA_HOME="$LIBRETRANSLATE_ROOT/.local/jdk/Contents/Home"
elif [ -z "${JAVA_HOME:-}" ]; then
  JAVA_HOME="$(/usr/libexec/java_home 2>/dev/null)" || true
  export JAVA_HOME
fi
export PATH="${JAVA_HOME:+$JAVA_HOME/bin:}$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator:$ANDROID_HOME/cmdline-tools/latest/bin:$PATH"
