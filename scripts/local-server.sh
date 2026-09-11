#!/bin/bash
set -euo pipefail
source "$(dirname "$0")/local-env.sh"
cd "$LIBRETRANSLATE_ROOT"
if [ ! -x .local/server-venv/bin/libretranslate ]; then
  uv venv --python 3.11 .local/server-venv
  uv pip install --python .local/server-venv/bin/python 'libretranslate==1.9.6'
fi
mkdir -p .local/server-data
cd .local/server-data
export PYTHONUNBUFFERED=1
exec ../server-venv/bin/libretranslate --host 127.0.0.1 --port 5001 --load-only en,es --char-limit 5000 --req-limit 60
