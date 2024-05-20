#!/usr/bin/env bash
set -e
npx tsc --project tsconfig.front.json
npx vite build
npx tsc --project tsconfig.back.json
cp -R dist build/