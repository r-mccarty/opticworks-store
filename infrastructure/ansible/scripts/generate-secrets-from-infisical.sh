#!/bin/bash
# Generate Ansible secrets.yml from Infisical
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$(dirname "$SCRIPT_DIR")"
SECRETS_FILE="$ANSIBLE_DIR/group_vars/secrets.yml"

echo "🔐 Generating Ansible secrets from Infisical..."

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

# Generate secrets.yml
cat > "$SECRETS_FILE" <<'EOF'
---
# Auto-generated from Infisical - DO NOT EDIT MANUALLY
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

EOF

# Fetch secrets from Infisical and convert to Ansible format
echo "📥 Fetching secrets from Infisical..."

# Get individual secrets
POSTGRES_PASSWORD=$(infisical secrets get POSTGRES_PASSWORD --plain 2>/dev/null || echo "")
MEDUSA_ADMIN_EMAIL=$(infisical secrets get MEDUSA_ADMIN_EMAIL --plain 2>/dev/null || echo "admin@optic.works")
MEDUSA_ADMIN_PASSWORD=$(infisical secrets get MEDUSA_ADMIN_PASSWORD --plain 2>/dev/null || echo "")
JWT_SECRET=$(infisical secrets get JWT_SECRET --plain 2>/dev/null || echo "")
COOKIE_SECRET=$(infisical secrets get COOKIE_SECRET --plain 2>/dev/null || echo "")
MEDUSA_SECRET_KEY=$(infisical secrets get MEDUSA_SECRET_KEY --plain 2>/dev/null || echo "")
CF_TUNNEL_ID=$(infisical secrets get CLOUDFLARE_TUNNEL_ID --plain 2>/dev/null || echo "db4738a9-20b7-4dd7-bde2-0760e0188071")
CF_TUNNEL_CREDS=$(infisical secrets get CLOUDFLARE_TUNNEL_CREDENTIALS --plain 2>/dev/null || echo "")

# Generate missing secrets if needed
if [ -z "$POSTGRES_PASSWORD" ]; then
    echo "⚠️  POSTGRES_PASSWORD not in Infisical, generating..."
    POSTGRES_PASSWORD=$(openssl rand -base64 32)
fi

if [ -z "$MEDUSA_ADMIN_PASSWORD" ]; then
    echo "⚠️  MEDUSA_ADMIN_PASSWORD not in Infisical, generating..."
    MEDUSA_ADMIN_PASSWORD=$(openssl rand -base64 16)
fi

if [ -z "$JWT_SECRET" ]; then
    echo "⚠️  JWT_SECRET not in Infisical, generating..."
    JWT_SECRET=$(openssl rand -hex 32)
fi

if [ -z "$COOKIE_SECRET" ]; then
    echo "⚠️  COOKIE_SECRET not in Infisical, generating..."
    COOKIE_SECRET=$(openssl rand -hex 32)
fi

# Write secrets to file
cat >> "$SECRETS_FILE" <<EOF
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

echo "✅ Secrets file generated: $SECRETS_FILE"
echo ""
echo "Next steps:"
echo "  1. Review secrets: cat $SECRETS_FILE"
echo "  2. Encrypt with Ansible Vault: ansible-vault encrypt $SECRETS_FILE"
echo "  3. Run playbook: ansible-playbook playbooks/medusa-provision.yml --ask-vault-pass"
echo ""
echo "⚠️  IMPORTANT: Store any generated secrets back in Infisical!"
