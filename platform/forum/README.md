# OpticWorks Forum (Phase 3 – Community Launch)

Discourse deployment scaffold for the Presence developer + installer community. This workspace holds the docker-compose stack, env template, and theme assets.

## Getting Started

```bash
cd platform/forum
cp .env.example .env     # fill in SMTP + S3 creds
docker compose up -d
```

- Access Discourse at http://localhost:8085 after the initial bootstrapping completes (first run can take several minutes).
- Use the `DISCOURSE_HOSTNAME` env to set the final domain when deploying to Hetzner.

## Theme Development

Custom SCSS/JS lives in `theme/`. The docker-compose volume maps this folder into Discourse’s plugins directory so changes hot-reload in development. Start by editing `theme/theme.scss` and `theme/settings.yml`.

## SSO Placeholder

- Phase 3 focuses on theming + bootstrap. Authentication stays local/admin for now.
- Document how Ory Hydra would integrate:
  1. Enable `enable_discourse_connect` in `settings.yml`.
  2. Point `auth_discourse_connect_url` to the Hydra-backed SSO bridge.
  3. Share secrets via `/config/forum.env` during Phase 3 hardening.

## Deployment Notes

- Production target: Hetzner VM + Docker Compose (mirrors this file).
- Add backups (S3/R2) by filling the S3 env vars.
- Use the same `DISCOURSE_SMTP_*` values that current support mailboxes rely on so notifications succeed.
