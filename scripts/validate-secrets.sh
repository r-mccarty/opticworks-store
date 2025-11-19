#!/usr/bin/env bash
# OpticWorks Secret Validation Script
# Compares .env.local against .env.template to find missing variables

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== OpticWorks Secret Validation ===${NC}\n"

# Files to compare
TEMPLATE_FILE=".env.template"
LOCAL_FILE=".env.local"

# Check if files exist
if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo -e "${RED}❌ Error: $TEMPLATE_FILE not found${NC}"
  exit 1
fi

if [[ ! -f "$LOCAL_FILE" ]]; then
  echo -e "${YELLOW}⚠️  Warning: $LOCAL_FILE not found${NC}"
  echo "Run 'pnpm run secrets:pull' to generate it from Infisical"
  exit 1
fi

# Extract variable names (ignore comments and empty lines)
echo "📋 Extracting variable names..."

# From template (get variable names, ignore comments and empty lines)
template_vars=$(grep -v '^#' "$TEMPLATE_FILE" | grep -v '^$' | grep '=' | cut -d'=' -f1 | sort)
template_count=$(echo "$template_vars" | wc -l)

# From local (get variable names, ignore comments and empty lines)
local_vars=$(grep -v '^#' "$LOCAL_FILE" | grep -v '^$' | grep '=' | cut -d'=' -f1 | sed "s/'//g" | sort)
local_count=$(echo "$local_vars" | wc -l)

echo -e "${BLUE}Template variables:${NC} $template_count"
echo -e "${BLUE}Local variables:${NC} $local_count"
echo ""

# Find missing variables
echo -e "${YELLOW}📊 Analysis:${NC}\n"

missing_vars=()
while IFS= read -r var; do
  if ! echo "$local_vars" | grep -q "^${var}$"; then
    missing_vars+=("$var")
  fi
done <<< "$template_vars"

missing_count=${#missing_vars[@]}

# Calculate coverage
if [[ $template_count -gt 0 ]]; then
  coverage=$(( (local_count * 100) / template_count ))
else
  coverage=0
fi

echo -e "${GREEN}✅ Present in .env.local:${NC} $local_count variables"
echo -e "${RED}❌ Missing from .env.local:${NC} $missing_count variables"
echo -e "${BLUE}📈 Coverage:${NC} ${coverage}%\n"

# Show missing variables if any
if [[ $missing_count -gt 0 ]]; then
  echo -e "${YELLOW}Missing Variables (organized by category):${NC}\n"

  # Categorize missing variables by prefix
  cloudflare=()
  stripe=()
  medusa=()
  analytics=()
  email=()
  other=()

  for var in "${missing_vars[@]}"; do
    case "$var" in
      R2_*|CLOUDFLARE_*)
        cloudflare+=("$var")
        ;;
      STRIPE_*)
        stripe+=("$var")
        ;;
      *MEDUSA*|DATABASE_*|REDIS_*|JWT_*|COOKIE_*)
        medusa+=("$var")
        ;;
      *POSTHOG*|*SENTRY*|*GA_*)
        analytics+=("$var")
        ;;
      *RESEND*|*EMAIL*)
        email+=("$var")
        ;;
      *)
        other+=("$var")
        ;;
    esac
  done

  # Print categories
  if [[ ${#cloudflare[@]} -gt 0 ]]; then
    echo -e "${BLUE}☁️  Cloudflare (${#cloudflare[@]}):${NC}"
    printf '   - %s\n' "${cloudflare[@]}"
    echo ""
  fi

  if [[ ${#medusa[@]} -gt 0 ]]; then
    echo -e "${BLUE}🛒 Medusa Backend (${#medusa[@]}):${NC}"
    printf '   - %s\n' "${medusa[@]}"
    echo ""
  fi

  if [[ ${#stripe[@]} -gt 0 ]]; then
    echo -e "${BLUE}💳 Stripe (${#stripe[@]}):${NC}"
    printf '   - %s\n' "${stripe[@]}"
    echo ""
  fi

  if [[ ${#email[@]} -gt 0 ]]; then
    echo -e "${BLUE}📧 Email/Communication (${#email[@]}):${NC}"
    printf '   - %s\n' "${email[@]}"
    echo ""
  fi

  if [[ ${#analytics[@]} -gt 0 ]]; then
    echo -e "${BLUE}📊 Analytics/Monitoring (${#analytics[@]}):${NC}"
    printf '   - %s\n' "${analytics[@]}"
    echo ""
  fi

  if [[ ${#other[@]} -gt 0 ]]; then
    echo -e "${BLUE}🔧 Other (${#other[@]}):${NC}"
    printf '   - %s\n' "${other[@]}"
    echo ""
  fi
fi

# Show coverage status
echo -e "${BLUE}=== Recommendations ===${NC}\n"

if [[ $coverage -lt 20 ]]; then
  echo -e "${RED}⚠️  CRITICAL: Very low secret coverage (<20%)${NC}"
  echo "   → See docs/INFISICAL_SECRETS_INVENTORY.md for migration plan"
  echo "   → Push Phase 1 critical secrets (18 vars) immediately"
elif [[ $coverage -lt 50 ]]; then
  echo -e "${YELLOW}⚠️  LOW: Insufficient secret coverage (<50%)${NC}"
  echo "   → Add Phase 2 secrets for full functionality"
  echo "   → See .env.infisical-push for ready-to-upload secrets"
elif [[ $coverage -lt 80 ]]; then
  echo -e "${YELLOW}✅ MODERATE: Good coverage (50-80%)${NC}"
  echo "   → Add remaining optional integrations as needed"
else
  echo -e "${GREEN}✅ EXCELLENT: High coverage (>80%)${NC}"
  echo "   → Review missing variables - may be optional"
fi

echo ""
echo -e "${BLUE}💡 Next Steps:${NC}"
echo "   1. Review missing variables above"
echo "   2. Add critical secrets to Infisical web UI"
echo "   3. Run 'pnpm run secrets:pull' to sync"
echo "   4. Re-run this script to verify"
echo ""

exit 0
