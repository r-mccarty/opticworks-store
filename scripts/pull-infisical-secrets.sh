#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v infisical >/dev/null 2>&1; then
  echo "Infisical CLI is not installed. Run the devcontainer post-create script or install it manually." >&2
  exit 1
fi

if [ -z "${INFISICAL_TOKEN:-}" ]; then
  echo "INFISICAL_TOKEN is not set. Provide a service token (Codespaces secret or shell env) to pull secrets." >&2
  exit 1
fi

INFISICAL_ENVIRONMENT_VALUE="${INFISICAL_ENVIRONMENT:-development}"
INFISICAL_SECRETS_PATH_VALUE="${INFISICAL_SECRETS_PATH:-/opticworks/storefront}"
INFISICAL_OUTPUT_FILE_VALUE="${INFISICAL_OUTPUT_FILE:-.env.local}"

SITE_ARGS=()
if [ -n "${INFISICAL_SITE_URL:-}" ]; then
  SITE_ARGS+=(--site-url "${INFISICAL_SITE_URL}")
fi

LOGIN_CMD=(infisical login --token "$INFISICAL_TOKEN")
LOGIN_CMD+=("${SITE_ARGS[@]}")

# Refresh CLI auth so stale sessions don't break automated pulls.
infisical logout >/dev/null 2>&1 || true
"${LOGIN_CMD[@]}" >/dev/null

PULL_CMD=(infisical secrets pull \
  --path "$INFISICAL_SECRETS_PATH_VALUE" \
  --env "$INFISICAL_ENVIRONMENT_VALUE" \
  --format=dotenv \
  --out-file "$INFISICAL_OUTPUT_FILE_VALUE")

"${PULL_CMD[@]}"

infisical logout >/dev/null 2>&1 || true

echo "Infisical secrets synced to $INFISICAL_OUTPUT_FILE_VALUE"
