#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v infisical >/dev/null 2>&1; then
  echo "Infisical CLI is not installed. Run the devcontainer post-create script or install it manually." >&2
  exit 1
fi

# Support both INFISICAL_SERVICE_TOKEN (preferred) and INFISICAL_TOKEN (fallback)
INFISICAL_TOKEN="${INFISICAL_SERVICE_TOKEN:-${INFISICAL_TOKEN:-}}"

if [ -z "$INFISICAL_TOKEN" ]; then
  echo "INFISICAL_SERVICE_TOKEN (or INFISICAL_TOKEN) is not set. Provide a service token (Codespaces secret or shell env) to pull secrets." >&2
  exit 1
fi

INFISICAL_ENVIRONMENT_VALUE="${INFISICAL_ENVIRONMENT:-development}"
INFISICAL_SECRETS_PATH_VALUE="${INFISICAL_SECRETS_PATH:-/}"
INFISICAL_OUTPUT_FILE_VALUE="${INFISICAL_OUTPUT_FILE:-.env.local}"

# Use service token to export secrets directly (no login needed)
infisical export \
  --token="$INFISICAL_TOKEN" \
  --env="$INFISICAL_ENVIRONMENT_VALUE" \
  --path="$INFISICAL_SECRETS_PATH_VALUE" \
  --format=dotenv > "$INFISICAL_OUTPUT_FILE_VALUE"

echo "Infisical secrets synced to $INFISICAL_OUTPUT_FILE_VALUE"
