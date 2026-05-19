# Deployment

The project is configured for GitHub Actions and GitHub Pages.

## CI

`.github/workflows/ci.yml` runs on pushes and pull requests to `main`.

It checks:

- `pnpm format:check`
- `pnpm test`
- `pnpm lint`
- `pnpm build`
- `pnpm test:e2e`

Local E2E tests use the system Microsoft Edge browser. CI installs Playwright-managed Chromium on the GitHub runner.

## GitHub Pages

`.github/workflows/deploy-pages.yml` deploys the production `dist` build to GitHub Pages on each push to `main`.

For a normal project repository such as `mini-cad-measure`, Vite builds with the base path `/mini-cad-measure/` in GitHub Actions. Local builds keep `/` as the base path.

After the first successful deployment, the public site URL will be shown in the workflow summary. It will usually be:

```txt
https://<github-user-or-org>.github.io/mini-cad-measure/
```
