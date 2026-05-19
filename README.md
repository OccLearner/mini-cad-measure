# mini-cad-measure

A lightweight internal learning demo for a 2D SVG CAD measuring workflow.

## Scripts

```sh
pnpm install
pnpm dev
pnpm test
pnpm lint
pnpm build
pnpm test:e2e
```

If the local machine has Corepack but no global `pnpm` shim, use:

```sh
corepack pnpm install
corepack pnpm dev
```

Playwright is configured to use the system Microsoft Edge browser. This avoids downloading Playwright-managed Chromium for local E2E tests on Windows.

## Deployment

GitHub Actions workflows are included for CI and GitHub Pages deployment:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`

For a repository named `mini-cad-measure`, the public Pages URL will usually be:

```txt
https://<github-user-or-org>.github.io/mini-cad-measure/
```

## Current Status

Phase 5 contains the project skeleton, viewport coordinate conversion, pointer coordinate tracking, zoom and pan controls, SVG drawing workflows for lines, rectangles, and circles, object selection, selected-object properties, two-point distance measurement, undo/redo, and local save/load.
