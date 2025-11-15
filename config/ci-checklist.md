# CI Checklist

Run these commands in GitHub Actions (or other CI) before merging:

1. `pnpm install`
2. `pnpm run lint`
3. `pnpm run build`
4. `pnpm docs:build`
5. `pnpm --filter @opticworks/medusa-service lint` (placeholder until real tests exist)
6. `pnpm --filter @opticworks/medusa-service build` (ensures backend compiles)

Future additions:
- Medusa unit/e2e tests once implemented
- Discourse theme linting (stylelint) when theme expands
- Deployment packaging for docs + forum
