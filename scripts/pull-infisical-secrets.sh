#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

if ! command -v infisical >/dev/null 2>&1; then
  echo "Infisical CLI is not installed. Run the devcontainer post-create script or install it manually." >&2
  exit 1
fi

if [ -z "${INFISICAL_SERVICE_TOKEN:-}" ]; then
  echo "INFISICAL_SERVICE_TOKEN is not set. Provide a service token (Codespaces secret or shell env) to pull secrets." >&2
  exit 1
fi

# NOTE: Infisical environments are 'dev', 'staging', 'prod' (not 'development', 'staging', 'production')
# All secrets are at root path '/' - no subpaths needed
INFISICAL_ENVIRONMENT_VALUE="${INFISICAL_ENVIRONMENT:-dev}"
INFISICAL_OUTPUT_FILE_VALUE="${INFISICAL_OUTPUT_FILE:-.env.local}"

# Use service token to export secrets directly (no login needed)
infisical export \
  --token="$INFISICAL_SERVICE_TOKEN" \
  --env="$INFISICAL_ENVIRONMENT_VALUE" \
  --format=dotenv > "$INFISICAL_OUTPUT_FILE_VALUE"

echo "Infisical secrets synced to $INFISICAL_OUTPUT_FILE_VALUE (env: $INFISICAL_ENVIRONMENT_VALUE)"
