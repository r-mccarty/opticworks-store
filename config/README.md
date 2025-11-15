# Config & Environment Templates (Track T5)

This directory centralizes environment examples and ops checklists so we can retire ad-hoc secrets (`.credentials/`, scattered `.env` files) once Track T5 is complete.

## Files

| File | Description |
| --- | --- |
| `storefront.env.example` | Copy to `.env.local` for the Next.js app (mirrors README env block). |
| `medusa.env.example` | Alias of `services/medusa/.env.example` for secrets management tools. |
| `forum.env.example` | Alias of `platform/forum/.env.example`. |
| `docs.env.example` | Optional if future docs build requires API keys (none today). |
| `ci-checklist.md` | Rolling list of build/lint/test commands that CI must execute. |

## Workflow

1. Keep the canonical env keys here; reference them from README/AGENTS.
2. During deployment, sync these files into Doppler/1Password/Cloudflare Workers secrets.
3. Remove the legacy `.credentials/` directory after copying its contents into the new structure.

### CI Preview

CI must run, at minimum:

```bash
pnpm run lint
pnpm run build
pnpm --filter @opticworks/medusa-service lint # placeholder until real tests exist
pnpm docs:build
```

Document new commands/tests here as they are added so the infra team can wire them into GitHub Actions.
