#!/bin/bash
# Sync Ansible secrets.yml from Infisical (Source of Truth)
# This script ONLY pulls from Infisical - it does NOT generate secrets
# Use backend/src/scripts/generate-secrets.ts to create new secrets first
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$(dirname "$SCRIPT_DIR")"
SECRETS_FILE="$ANSIBLE_DIR/group_vars/secrets.yml"

# Infisical configuration
# NOTE: Environments are 'dev', 'staging', 'prod' (not 'development', 'staging', 'production')
# All secrets are at root path '/' - no subpaths like /infrastructure or /medusa
INFISICAL_ENV="${INFISICAL_ENV:-prod}"

echo "🔐 Syncing Ansible secrets from Infisical..."
echo "   Environment: $INFISICAL_ENV"
echo ""

# Check if Infisical CLI is available
if ! command -v infisical &> /dev/null; then
    echo "❌ Infisical CLI not found. Install from: https://infisical.com/docs/cli/overview"
    exit 1
fi

# Check if INFISICAL_SERVICE_TOKEN is set
if [ -z "$INFISICAL_SERVICE_TOKEN" ]; then
    echo "❌ INFISICAL_SERVICE_TOKEN not set"
    echo "   Set it in your environment or GitHub Codespaces secrets"
    exit 1
fi

# Function to get secret from Infisical (all secrets at root path)
get_secret() {
    local key=$1
    local required=$2

    local value=$(infisical secrets get "$key" \
        --token="$INFISICAL_SERVICE_TOKEN" \
        --env="$INFISICAL_ENV" \
        --plain 2>/dev/null || echo "")

    if [ -z "$value" ] && [ "$required" = "true" ]; then
        echo "❌ CRITICAL: Required secret '$key' not found in Infisical"
        echo "   Environment: $INFISICAL_ENV"
        echo ""
        echo "   To fix this:"
        echo "   1. Generate secrets: cd backend && pnpm run generate:secrets"
        echo "   2. Manually add '$key' to Infisical web UI (environment: $INFISICAL_ENV)"
        echo "   3. Re-run this script"
        exit 1
    fi

    echo "$value"
}

# Fetch all secrets from Infisical (STRICT - no fallbacks)
echo "📥 Fetching secrets from Infisical ($INFISICAL_ENV environment)..."
POSTGRES_PASSWORD=$(get_secret "POSTGRES_PASSWORD" "true")
CF_TUNNEL_ID=$(get_secret "CLOUDFLARE_TUNNEL_ID" "true")
CF_TUNNEL_CREDS=$(get_secret "CLOUDFLARE_TUNNEL_CREDENTIALS" "true")
JWT_SECRET=$(get_secret "JWT_SECRET" "true")
COOKIE_SECRET=$(get_secret "COOKIE_SECRET" "true")
MEDUSA_ADMIN_EMAIL=$(get_secret "MEDUSA_ADMIN_EMAIL" "false")
MEDUSA_ADMIN_PASSWORD=$(get_secret "MEDUSA_ADMIN_PASSWORD" "true")
MEDUSA_SECRET_KEY=$(get_secret "MEDUSA_SECRET_KEY" "false")

# Default admin email if not set
MEDUSA_ADMIN_EMAIL="${MEDUSA_ADMIN_EMAIL:-admin@optic.works}"

# Validate critical secrets are not empty
if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$JWT_SECRET" ] || [ -z "$COOKIE_SECRET" ] || [ -z "$MEDUSA_ADMIN_PASSWORD" ]; then
    echo "❌ One or more critical secrets are missing from Infisical"
    echo "   This should not happen - check error messages above"
    exit 1
fi

echo "✅ All required secrets fetched successfully"
echo ""

# Generate secrets.yml with timestamp
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S UTC")
cat > "$SECRETS_FILE" <<EOF
---
# Auto-generated from Infisical - DO NOT EDIT MANUALLY
# Source of Truth: Infisical (Environment: $INFISICAL_ENV)
# Generated: $TIMESTAMP

# PostgreSQL
postgres_db_password: "$POSTGRES_PASSWORD"

# Medusa Admin
medusa_admin_email: "$MEDUSA_ADMIN_EMAIL"
medusa_admin_password: "$MEDUSA_ADMIN_PASSWORD"

# Medusa Secrets
jwt_secret: "$JWT_SECRET"
cookie_secret: "$COOKIE_SECRET"
medusa_secret_key: "$MEDUSA_SECRET_KEY"

# Cloudflare Tunnel
cloudflare_tunnel_id: "$CF_TUNNEL_ID"
cloudflare_tunnel_credentials: |
  $CF_TUNNEL_CREDS
EOF

echo "✅ Secrets file synced: $SECRETS_FILE"
echo ""
echo "Next steps:"
echo "  1. Review secrets: cat $SECRETS_FILE"
echo "  2. (Optional) Encrypt with Ansible Vault: ansible-vault encrypt $SECRETS_FILE"
echo "  3. Run playbook: ansible-playbook playbooks/medusa-provision.yml"
echo ""
echo "💡 Remember: Infisical is the source of truth - never edit $SECRETS_FILE manually"
