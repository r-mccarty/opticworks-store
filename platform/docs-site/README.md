# OpticWorks Docs Site

Hugo source for [docs.optic.works](https://docs.optic.works). Configuration is in `hugo.yaml`.
The theme is the local `themes/opticboot`. Content is in `content/` (not mounted from the
repository's `/docs` folder).

> **Content status (audited 2026-10-29):** the published pages describe a "Bed Presence
> Sensor" and a mobile "OpticWorks app" (iOS/Android) with breathing-rate monitoring, sleep
> stages, Matter and Bluetooth. That conflicts with the website's product material (OW-1
> developer kit, Home Assistant integration). Treat the content as unverified until it's
> rewritten with the product redesign. See the audit in
> [`docs/reference/BACKEND_OFFLINE_FRONTEND.md`](../../docs/reference/BACKEND_OFFLINE_FRONTEND.md#hugo-docs-audit).

## Commands

Requires [Hugo Extended](https://gohugo.io/installation/) v0.125+.

```bash
# From repo root
pnpm docs:dev    # hugo server -s platform/docs-site -D
pnpm docs:build  # hugo -s platform/docs-site
```

## Deployment

`wrangler.toml` describes a Cloudflare Pages project, `opticworks-docs`, with output dir
`public` and the custom domain docs.optic.works configured in the dashboard.
`netlify.toml` is an unused alternative. The docs build isn't part of CI.
