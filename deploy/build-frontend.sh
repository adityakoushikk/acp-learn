#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
unset NEXT_DIST_DIR

pnpm install --frozen-lockfile
pnpm typecheck
pnpm build

# Next.js standalone output intentionally omits these static assets.
cp -R public .next/standalone/
mkdir -p .next/standalone/.next
cp -R .next/static .next/standalone/.next/

echo "Frontend production bundle is ready in .next/standalone"
