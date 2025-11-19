#!/bin/bash
# Push Phase 2 Secrets to Infisical
# This script pushes all Phase 2 environment variables to Infisical using the CLI

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Infisical Secrets Push Script ===${NC}"
echo "Date: $(date)"
echo ""

# Check if Infisical CLI is installed
if ! command -v infisical &> /dev/null; then
    echo -e "${RED}Error: Infisical CLI not found${NC}"
    echo "Install: https://infisical.com/docs/cli/overview"
    exit 1
fi

echo -e "${GREEN}✓ Infisical CLI found:${NC} $(infisical --version)"
echo ""

# Check for authentication (try both INFISICAL_TOKEN and INFISICAL_SERVICE_TOKEN)
if [ -z "$INFISICAL_TOKEN" ]; then
    if [ -n "$INFISICAL_SERVICE_TOKEN" ]; then
        echo -e "${YELLOW}Note: Using INFISICAL_SERVICE_TOKEN (renaming to INFISICAL_TOKEN)${NC}"
        export INFISICAL_TOKEN="$INFISICAL_SERVICE_TOKEN"
    else
        echo -e "${RED}Error: No authentication found${NC}"
        echo "Set one of:"
        echo "  export INFISICAL_TOKEN=st.xxxxx"
        echo "  export INFISICAL_SERVICE_TOKEN=st.xxxxx"
        echo ""
        echo "Or authenticate with:"
        echo "  infisical login"
        exit 1
    fi
fi

echo -e "${GREEN}✓ Authentication configured${NC}"
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${RED}Error: .env.local not found${NC}"
    echo "This script expects secrets in .env.local"
    exit 1
fi

echo -e "${GREEN}✓ Found .env.local${NC}"
echo ""

# Parse secrets from .env.local (excluding comments and empty lines)
echo -e "${YELLOW}Parsing secrets from .env.local...${NC}"

# Function to push secrets to a specific path/environment
push_secrets() {
    local env=$1
    local path=$2
    shift 2
    local secrets=("$@")

    echo ""
    echo -e "${YELLOW}Pushing to Environment: $env, Path: $path${NC}"

    for secret in "${secrets[@]}"; do
        # Extract key and value
        key=$(echo "$secret" | cut -d'=' -f1)
        value=$(echo "$secret" | cut -d'=' -f2-)

        # Skip if value is empty or a placeholder
        if [[ -z "$value" ]] || [[ "$value" == "..." ]] || [[ "$value" == *"REDACTED"* ]]; then
            echo -e "${YELLOW}  ⊘ Skipping $key (placeholder value)${NC}"
            continue
        fi

        # Push secret to Infisical
        if infisical secrets set "$key=$value" --env="$env" --path="$path" --silent 2>/dev/null; then
            echo -e "${GREEN}  ✓ $key${NC}"
        else
            echo -e "${RED}  ✗ Failed to push $key${NC}"
        fi
    done
}

# Extract secrets from .env.local (non-comment, non-empty lines)
declare -a storefront_secrets=()
declare -a backend_secrets=()
declare -a infra_secrets=()

while IFS= read -r line; do
    # Skip comments and empty lines
    [[ "$line" =~ ^#.*$ ]] && continue
    [[ -z "$line" ]] && continue

    # Extract key
    key=$(echo "$line" | cut -d'=' -f1)

    # Categorize secrets
    case "$key" in
        NEXT_PUBLIC_*|MEDUSA_ADMIN_EMAIL|MEDUSA_ADMIN_PASSWORD|MEDUSA_SECRET_KEY|STRIPE_SECRET_KEY|STRIPE_API_KEY)
            storefront_secrets+=("$line")
            ;;
        JWT_SECRET|COOKIE_SECRET|MEDUSA_STORE_CORS|MEDUSA_ADMIN_CORS)
            backend_secrets+=("$line")
            ;;
        POSTGRES_PASSWORD|DATABASE_URL|REDIS_URL)
            infra_secrets+=("$line")
            ;;
    esac
done < .env.local

# Display summary
echo ""
echo -e "${GREEN}=== Push Summary ===${NC}"
echo "Storefront secrets (/, development): ${#storefront_secrets[@]}"
echo "Backend secrets (/medusa, production): ${#backend_secrets[@]}"
echo "Infrastructure secrets (/infrastructure, production): ${#infra_secrets[@]}"
echo ""

# Confirm before proceeding
read -p "Proceed with push? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

# Push storefront secrets
if [ ${#storefront_secrets[@]} -gt 0 ]; then
    push_secrets "development" "/" "${storefront_secrets[@]}"
fi

# Push backend secrets
if [ ${#backend_secrets[@]} -gt 0 ]; then
    push_secrets "production" "/medusa" "${backend_secrets[@]}"
fi

# Push infrastructure secrets
if [ ${#infra_secrets[@]} -gt 0 ]; then
    push_secrets "production" "/infrastructure" "${infra_secrets[@]}"
fi

echo ""
echo -e "${GREEN}=== Push Complete ===${NC}"
echo ""
echo "Verify in Infisical web UI:"
echo "  https://app.infisical.com"
echo ""
echo "Next steps:"
echo "  1. Verify all secrets in Infisical web UI"
echo "  2. Test secret retrieval with:"
echo "     infisical secrets --env=development --path=/"
echo "  3. Update team to use Infisical as source of truth"
