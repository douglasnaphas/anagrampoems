#!/usr/bin/env bash
set -e
rm -rf node_modules
npm install
npx tsc --project tsconfig.front.json
npx vite build
mkdir -p build
cp -R dist build/
npx tsc --project tsconfig.back.json
cp -R node_modules build/