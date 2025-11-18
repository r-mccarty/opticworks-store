#!/bin/bash
# Generate Ansible secrets.yml from Infisical  
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANSIBLE_DIR="$(dirname "$SCRIPT_DIR")"
SECRETS_FILE="$ANSIBLE_DIR/group_vars/secrets.yml"

echo "🔐 Generating Ansible secrets from Infisical..."
echo "✅ Secrets file will be created at: $SECRETS_FILE"
echo ""
echo "⚠️  For now, please manually create secrets.yml from secrets.yml.example"
echo "    Then encrypt with: ansible-vault encrypt group_vars/secrets.yml"
