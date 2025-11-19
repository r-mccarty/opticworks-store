#!/usr/bin/env bash
# Push current working Medusa backend secrets to Infisical
# This preserves the existing working configuration before enabling pull automation

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Push Medusa Backend Secrets to Infisical ===${NC}\n"

# Check Infisical CLI
if ! command -v infisical &> /dev/null; then
    echo -e "${RED}❌ Infisical CLI not found${NC}"
    echo "Install from: https://infisical.com/docs/cli/overview"
    exit 1
fi

# Check token
if [ -z "${INFISICAL_SERVICE_TOKEN:-}" ]; then
    echo -e "${RED}❌ INFISICAL_SERVICE_TOKEN not set${NC}"
    echo "Set it in your environment or GitHub Codespaces secrets"
    exit 1
fi

# Paths
ANSIBLE_SECRETS="../../infrastructure/ansible/group_vars/secrets.yml"

if [ ! -f "$ANSIBLE_SECRETS" ]; then
    echo -e "${RED}❌ Ansible secrets.yml not found: $ANSIBLE_SECRETS${NC}"
    exit 1
fi

echo -e "${YELLOW}📋 Extracting secrets from Ansible secrets.yml...${NC}\n"

# Read secrets from Ansible YAML
POSTGRES_PASSWORD=$(grep "postgres_db_password:" "$ANSIBLE_SECRETS" | awk '{print $2}' | tr -d '"')
MEDUSA_ADMIN_EMAIL=$(grep "medusa_admin_email:" "$ANSIBLE_SECRETS" | awk '{print $2}' | tr -d '"')
MEDUSA_ADMIN_PASSWORD=$(grep "medusa_admin_password:" "$ANSIBLE_SECRETS" | awk '{print $2}' | tr -d '"')
JWT_SECRET=$(grep "jwt_secret:" "$ANSIBLE_SECRETS" | awk '{print $2}' | tr -d '"')
COOKIE_SECRET=$(grep "cookie_secret:" "$ANSIBLE_SECRETS" | awk '{print $2}' | tr -d '"')
CLOUDFLARE_TUNNEL_ID=$(grep "cloudflare_tunnel_id:" "$ANSIBLE_SECRETS" | awk '{print $2}' | tr -d '"')

# Validate we got the critical secrets
if [ -z "$POSTGRES_PASSWORD" ] || [ -z "$JWT_SECRET" ] || [ -z "$COOKIE_SECRET" ]; then
    echo -e "${RED}❌ Failed to extract critical secrets from Ansible${NC}"
    exit 1
fi

# Construct DATABASE_URL
DATABASE_URL="postgresql://medusa_user:${POSTGRES_PASSWORD}@localhost:5432/medusa_db"

echo -e "${GREEN}✅ Extracted secrets from Ansible${NC}"
echo -e "${BLUE}Preview of secrets to push:${NC}"
echo "  - DATABASE_URL (with password)"
echo "  - REDIS_URL"
echo "  - MEDUSA_ADMIN_EMAIL: $MEDUSA_ADMIN_EMAIL"
echo "  - MEDUSA_ADMIN_PASSWORD: [encrypted]"
echo "  - JWT_SECRET: ${JWT_SECRET:0:16}... (64 chars)"
echo "  - COOKIE_SECRET: ${COOKIE_SECRET:0:16}... (64 chars)"
echo "  - CLOUDFLARE_TUNNEL_ID: $CLOUDFLARE_TUNNEL_ID"
echo ""

# Confirm before pushing
read -p "Push these secrets to Infisical? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo -e "${YELLOW}⚠️  Aborted. No changes made to Infisical.${NC}"
    exit 0
fi

echo -e "\n${YELLOW}📤 Pushing to Infisical...${NC}"

# Project ID extracted from service token
PROJECT_ID="42e9e77c-88fa-4cbb-925b-5064c8e3b18c"

# Push secrets using correct CLI syntax (key=value pairs)
infisical secrets set \
    "DATABASE_URL=${DATABASE_URL}" \
    "REDIS_URL=redis://localhost:6379" \
    "MEDUSA_ADMIN_EMAIL=${MEDUSA_ADMIN_EMAIL}" \
    "MEDUSA_ADMIN_PASSWORD=${MEDUSA_ADMIN_PASSWORD}" \
    "JWT_SECRET=${JWT_SECRET}" \
    "COOKIE_SECRET=${COOKIE_SECRET}" \
    "PORT=9000" \
    "MEDUSA_BACKEND_URL=https://api.optic.works" \
    "MEDUSA_STORE_CORS=http://localhost:3000,https://optic.works" \
    "MEDUSA_ADMIN_CORS=http://localhost:7000,http://localhost:8000,https://api.optic.works" \
    "CLOUDFLARE_TUNNEL_ID=${CLOUDFLARE_TUNNEL_ID}" \
    "NODE_ENV=production" \
    --env=development \
    --token="$INFISICAL_SERVICE_TOKEN"

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ SUCCESS! Backend secrets pushed to Infisical${NC}"
    echo -e "${BLUE}Location:${NC} OpticWorks → development environment"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Verify in Infisical web UI: https://app.infisical.com"
    echo "  2. Test pull: pnpm run medusa:secrets:pull"
    echo "  3. Compare pulled .env with Ansible secrets"
    echo ""
    echo -e "${GREEN}Current working state preserved in Infisical ✅${NC}"
else
    echo -e "\n${RED}❌ Failed to push to Infisical${NC}"
    echo "Check your INFISICAL_SERVICE_TOKEN permissions"
    exit 1
fi
