#!/usr/bin/env bash
set -euo pipefail

PNPM_VERSION="8.15.4"

need_pnpm=0

if ! command -v pnpm >/dev/null 2>&1; then
  need_pnpm=1
else
  if ! pnpm --version >/dev/null 2>&1; then
    need_pnpm=1
  fi
fi

if [ "$need_pnpm" -eq 1 ]; then
  echo "Installing pnpm@${PNPM_VERSION} via npm..."
  npm install -g "pnpm@${PNPM_VERSION}"
  hash -r
fi

if [ -z "${PNPM_HOME:-}" ]; then
  export PNPM_HOME="$HOME/.local/share/pnpm"
fi

if ! echo ":$PATH:" | grep -q ":$PNPM_HOME:"; then
  export PATH="$PNPM_HOME:$PATH"
fi

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm still unavailable after installation attempt" >&2
  exit 1
fi

pnpm install
pnpm --filter @rogue/server db:setup
