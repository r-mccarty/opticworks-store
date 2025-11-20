#!/usr/bin/env bash
#
# OpticWorks Phase 2 End-to-End Validation Script
#
# Comprehensive validation suite that proves Phase 2 completion by testing:
# - Infrastructure (PostgreSQL, Redis, Cloudflare Tunnel)
# - Backend APIs (Admin, Store, Health)
# - Product Catalog (7 products)
# - Cart Functionality
# - Stripe Integration
# - Secret Management (Infisical)
# - Build Validation (Next.js)
#
# This script serves as a QA artifact demonstrating full platform integration.
#
# Usage:
#   ./scripts/e2e-phase2-validation.sh              # Run all tests
#   ./scripts/e2e-phase2-validation.sh --verbose    # Show detailed output
#   ./scripts/e2e-phase2-validation.sh --full       # Run tests + generate markdown report
#   ./scripts/e2e-phase2-validation.sh --report=json    # Generate JSON report
#   ./scripts/e2e-phase2-validation.sh --report=markdown # Generate markdown report
#
# Exit codes:
#   0 - All tests passed (Phase 2 validated)
#   1 - One or more tests failed
#   2 - Script error (missing dependencies, etc.)
#

set -euo pipefail

# Colors for output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
MEDUSA_DIR="${ROOT_DIR}/services/medusa"

# Default options
VERBOSE=false
REPORT_FORMAT=""
FULL_MODE=false

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Helper Functions
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_header() {
  echo ""
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
  echo -e "${BLUE} $1${NC}"
  echo -e "${BLUE}═══════════════════════════════════════════════════════════════════${NC}"
  echo ""
}

show_usage() {
  cat <<EOF
OpticWorks Phase 2 End-to-End Validation Suite

USAGE:
  $0 [OPTIONS]

OPTIONS:
  -h, --help          Show this help message
  -v, --verbose       Show detailed test output
  --full              Run tests + generate markdown report
  --report=FORMAT     Generate report (json|markdown)

EXAMPLES:
  # Run all tests with standard output
  $0

  # Run with verbose logging
  $0 --verbose

  # Run tests and generate markdown report
  $0 --full

  # Generate JSON report
  $0 --report=json

EXIT CODES:
  0 - All tests passed (Phase 2 validated)
  1 - One or more tests failed
  2 - Script error (missing dependencies, etc.)

EOF
}

check_dependencies() {
  log_info "Checking dependencies..."

  # Check for pnpm
  if ! command -v pnpm &> /dev/null; then
    log_error "pnpm is not installed. Please install pnpm first."
    return 1
  fi

  # Check for tsx (TypeScript executor)
  if ! command -v tsx &> /dev/null; then
    log_warning "tsx not found globally, will use local version"
  fi

  # Check for required directories
  if [[ ! -d "${MEDUSA_DIR}" ]]; then
    log_error "Medusa directory not found: ${MEDUSA_DIR}"
    return 1
  fi

  # Check for e2e-validation.ts script
  if [[ ! -f "${MEDUSA_DIR}/scripts/e2e-validation.ts" ]]; then
    log_error "E2E validation script not found: ${MEDUSA_DIR}/scripts/e2e-validation.ts"
    return 1
  fi

  log_success "All dependencies present"
  return 0
}

load_environment() {
  log_info "Loading environment variables..."

  # Check for .env file in Medusa directory
  if [[ -f "${MEDUSA_DIR}/.env" ]]; then
    log_success "Loading ${MEDUSA_DIR}/.env"
    set -a
    # shellcheck source=/dev/null
    source "${MEDUSA_DIR}/.env"
    set +a
  else
    log_warning "No .env file found in ${MEDUSA_DIR}"
  fi

  # Validate critical environment variables
  local missing_vars=()

  if [[ -z "${DATABASE_URL:-}" ]]; then
    missing_vars+=("DATABASE_URL")
  fi

  if [[ -z "${MEDUSA_ADMIN_EMAIL:-}" ]]; then
    log_warning "MEDUSA_ADMIN_EMAIL not set, using default"
  fi

  if [[ -z "${MEDUSA_ADMIN_PASSWORD:-}" ]]; then
    missing_vars+=("MEDUSA_ADMIN_PASSWORD")
  fi

  if [[ -z "${MEDUSA_PUBLISHABLE_KEY:-}" ]] && [[ -z "${NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY:-}" ]]; then
    missing_vars+=("MEDUSA_PUBLISHABLE_KEY or NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY")
  fi

  if [[ ${#missing_vars[@]} -gt 0 ]]; then
    log_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
      echo "  - ${var}"
    done
    echo ""
    log_info "Run 'pnpm run secrets:pull' to sync from Infisical"
    return 1
  fi

  log_success "Environment configured"
  return 0
}

run_validation() {
  log_header "🧪 OpticWorks Phase 2 End-to-End Validation"

  # Build command arguments
  local args=()

  if [[ "${VERBOSE}" == "true" ]]; then
    args+=("--verbose")
  fi

  if [[ -n "${REPORT_FORMAT}" ]]; then
    args+=("--report=${REPORT_FORMAT}")
  elif [[ "${FULL_MODE}" == "true" ]]; then
    args+=("--report=markdown")
  fi

  # Change to Medusa directory
  cd "${MEDUSA_DIR}"

  # Run the TypeScript validation script
  log_info "Running validation suite..."
  echo ""

  if pnpm exec tsx scripts/e2e-validation.ts "${args[@]}"; then
    log_success "Validation complete"
    return 0
  else
    local exit_code=$?
    log_error "Validation failed (exit code: ${exit_code})"
    return ${exit_code}
  fi
}

#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Main Execution
#━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

main() {
  # Parse arguments
  while [[ $# -gt 0 ]]; do
    case $1 in
      -h|--help)
        show_usage
        exit 0
        ;;
      -v|--verbose)
        VERBOSE=true
        shift
        ;;
      --full)
        FULL_MODE=true
        VERBOSE=true
        shift
        ;;
      --report=*)
        REPORT_FORMAT="${1#*=}"
        if [[ "${REPORT_FORMAT}" != "json" && "${REPORT_FORMAT}" != "markdown" ]]; then
          log_error "Invalid report format: ${REPORT_FORMAT} (must be json or markdown)"
          exit 2
        fi
        shift
        ;;
      *)
        log_error "Unknown option: $1"
        show_usage
        exit 2
        ;;
    esac
  done

  # Run validation workflow
  if ! check_dependencies; then
    exit 2
  fi

  if ! load_environment; then
    exit 2
  fi

  if ! run_validation; then
    exit 1
  fi

  # Success!
  echo ""
  log_header "✅ Phase 2 Validation Complete"

  if [[ "${FULL_MODE}" == "true" ]] || [[ "${REPORT_FORMAT}" == "markdown" ]]; then
    echo ""
    log_info "Validation report saved to: docs/PHASE2_VALIDATION_REPORT.md"
    echo ""
    log_info "Next steps:"
    echo "  1. Review the validation report"
    echo "  2. Commit the validation artifacts"
    echo "  3. Tag the commit: git tag phase2-complete-validated"
    echo "  4. Begin Phase 3 planning"
  fi

  echo ""
  exit 0
}

# Run main function
main "$@"
