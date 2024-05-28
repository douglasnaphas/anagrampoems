#!/usr/bin/env bash
set -e
rm -rf node_modules
npm install --production
npx vite build
npx tsc --project tsconfig.back.json
cp -R node_modules build/