#!/usr/bin/env bash
# Pull Medusa backend secrets from Infisical
# Safe script with automatic backup of existing .env

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=== Pull Medusa Backend Secrets from Infisical ===${NC}\n"

# Defaults align with current Infisical structure:
# - Environment slug: "prod"
# - Secrets stored at the root path "/"
INFISICAL_ENV_SLUG="${INFISICAL_ENV:-prod}"
INFISICAL_PATH="${INFISICAL_PATH:-/}"

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
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MEDUSA_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="$MEDUSA_DIR/.env"
BACKUP_DIR="$MEDUSA_DIR/.env-backups"

# Create backup directory if needed
mkdir -p "$BACKUP_DIR"

# Backup existing .env if it exists
if [ -f "$ENV_FILE" ]; then
    BACKUP_FILE="$BACKUP_DIR/.env.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${YELLOW}📦 Backing up existing .env...${NC}"
    cp "$ENV_FILE" "$BACKUP_FILE"
    echo -e "${GREEN}✅ Backup saved: $BACKUP_FILE${NC}\n"
fi

# Pull from Infisical
echo -e "${YELLOW}📥 Pulling secrets from Infisical...${NC}"
echo -e "${BLUE}Environment:${NC} ${INFISICAL_ENV_SLUG}"
echo -e "${BLUE}Path:${NC} ${INFISICAL_PATH}"
echo ""

# Use infisical export to get secrets
# Project ID extracted from service token
PROJECT_ID="42e9e77c-88fa-4cbb-925b-5064c8e3b18c"

infisical export \
    --env="${INFISICAL_ENV_SLUG}" \
    --path="${INFISICAL_PATH}" \
    --projectId="$PROJECT_ID" \
    --format=dotenv \
    --token="$INFISICAL_SERVICE_TOKEN" \
    > "$ENV_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ SUCCESS! Secrets pulled from Infisical${NC}\n"

    # Show summary
    SECRET_COUNT=$(grep -c "=" "$ENV_FILE" || echo "0")
    echo -e "${BLUE}📊 Summary:${NC}"
    echo "  - Variables pulled: $SECRET_COUNT"
    echo "  - Saved to: $ENV_FILE"
    if [ -f "$BACKUP_FILE" ]; then
        echo "  - Backup: $BACKUP_FILE"
    fi
    echo ""

    # Validate critical secrets are present
    echo -e "${YELLOW}🔍 Validating critical secrets...${NC}"
    MISSING=()

    for SECRET in DATABASE_URL REDIS_URL JWT_SECRET COOKIE_SECRET MEDUSA_ADMIN_EMAIL; do
        if ! grep -q "^${SECRET}=" "$ENV_FILE"; then
            MISSING+=("$SECRET")
        fi
    done

    if [ ${#MISSING[@]} -gt 0 ]; then
        echo -e "${RED}⚠️  WARNING: Missing critical secrets:${NC}"
        printf '  - %s\n' "${MISSING[@]}"
        echo ""
        echo -e "${YELLOW}Consider restoring from backup:${NC}"
        echo "  cp $BACKUP_FILE $ENV_FILE"
        exit 1
    else
        echo -e "${GREEN}✅ All critical secrets present${NC}\n"
    fi

    # Show next steps
    echo -e "${BLUE}Next steps:${NC}"
    echo "  1. Review the pulled secrets: cat services/medusa/.env"
    echo "  2. If on Hetzner, restart Medusa: pm2 restart medusa-prod"
    echo "  3. Verify health: curl https://api.optic.works/health"
    echo ""
    echo -e "${YELLOW}💡 To restore backup if needed:${NC}"
    echo "  cp $BACKUP_FILE $ENV_FILE"

else
    echo -e "${RED}❌ Failed to pull from Infisical${NC}"
    echo "Check your INFISICAL_SERVICE_TOKEN and network connection"

    # Restore backup if pull failed
    if [ -f "$BACKUP_FILE" ]; then
        echo -e "${YELLOW}Restoring backup...${NC}"
        cp "$BACKUP_FILE" "$ENV_FILE"
        echo -e "${GREEN}✅ Original .env restored${NC}"
    fi
    exit 1
fi
