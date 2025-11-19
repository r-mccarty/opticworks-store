# Infisical Automation Guide

**Last Updated**: 2025-11-19
**Status**: ✅ Ready to use
**Script**: `scripts/push-to-infisical.sh`

---

## Overview

This guide covers automated secret management with Infisical using the CLI. The automation script pushes all Phase 2 secrets from `.env.local` to Infisical in the correct environments and paths.

**Benefits**:
- One-command secret push
- Automatic environment/path routing
- Validation and error handling
- Interactive confirmation
- Skips placeholders automatically

---

## Prerequisites

### 1. Infisical CLI Installed

Already installed in GitHub Codespaces:
```bash
infisical --version
# Expected: infisical version 0.43.25 or later
```

**If not installed**:
```bash
# macOS
brew install infisical/get-cli/infisical

# Linux
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical

# See: https://infisical.com/docs/cli/overview
```

### 2. Service Token or Login

**Option A: Service Token (Recommended for CI/CD)**

Get from Infisical web UI → Project Settings → Service Tokens

```bash
export INFISICAL_TOKEN=st.xxxxx
# Or (script auto-detects both)
export INFISICAL_SERVICE_TOKEN=st.xxxxx
```

**Option B: Interactive Login (Recommended for Local Dev)**

```bash
infisical login
```

### 3. Source Secrets File

Ensure `.env.local` exists with all Phase 2 secrets:
```bash
# Should contain ~17 variables
wc -l .env.local
```

---

## Usage

### Quick Start

```bash
# Navigate to repository root
cd /workspaces/solar-saas-template

# Run the push script
./scripts/push-to-infisical.sh
```

### What It Does

1. **Validates Environment**:
   - Checks Infisical CLI is installed
   - Verifies authentication (token or login)
   - Confirms `.env.local` exists

2. **Parses Secrets**:
   - Reads `.env.local`
   - Categorizes by destination:
     - **Storefront**: `NEXT_PUBLIC_*`, Stripe, Medusa admin
     - **Backend**: `JWT_SECRET`, `COOKIE_SECRET`, CORS
     - **Infrastructure**: `POSTGRES_PASSWORD`, `DATABASE_URL`, `REDIS_URL`

3. **Routes to Correct Location**:
   - **Storefront** → Environment: `development`, Path: `/`
   - **Backend** → Environment: `production`, Path: `/medusa`
   - **Infrastructure** → Environment: `production`, Path: `/infrastructure`

4. **Interactive Confirmation**:
   ```
   === Push Summary ===
   Storefront secrets (/, development): 10
   Backend secrets (/medusa, production): 4
   Infrastructure secrets (/infrastructure, production): 3

   Proceed with push? (y/N):
   ```

5. **Pushes Secrets**:
   - Uses `infisical secrets set KEY=VALUE`
   - Skips placeholders (values with `...` or `REDACTED`)
   - Shows progress for each secret

### Example Output

```bash
$ ./scripts/push-to-infisical.sh

=== Infisical Secrets Push Script ===
Date: Wed Nov 19 06:47:48 AM UTC 2025

✓ Infisical CLI found: infisical version 0.43.25
✓ Authentication configured
✓ Found .env.local

Parsing secrets from .env.local...

=== Push Summary ===
Storefront secrets (/, development): 10
Backend secrets (/medusa, production): 4
Infrastructure secrets (/infrastructure, production): 3

Proceed with push? (y/N): y

Pushing to Environment: development, Path: /
  ✓ NEXT_PUBLIC_APP_URL
  ✓ NEXT_PUBLIC_MEDUSA_ENABLED
  ✓ NEXT_PUBLIC_MEDUSA_BASE_URL
  ✓ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
  ✓ MEDUSA_ADMIN_EMAIL
  ✓ MEDUSA_ADMIN_PASSWORD
  ✓ MEDUSA_SECRET_KEY
  ✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ✓ STRIPE_SECRET_KEY
  ✓ STRIPE_API_KEY

Pushing to Environment: production, Path: /medusa
  ✓ JWT_SECRET
  ✓ COOKIE_SECRET
  ✓ MEDUSA_STORE_CORS
  ✓ MEDUSA_ADMIN_CORS

Pushing to Environment: production, Path: /infrastructure
  ✓ POSTGRES_PASSWORD
  ✓ DATABASE_URL
  ✓ REDIS_URL

=== Push Complete ===

Verify in Infisical web UI:
  https://app.infisical.com
```

---

## Verification

After pushing, verify secrets in Infisical:

### Via Web UI

1. Go to https://app.infisical.com
2. Select OpticWorks project
3. Check environments:
   - **development** → Path: `/` → Should have 10 secrets
   - **production** → Path: `/medusa` → Should have 4 secrets
   - **production** → Path: `/infrastructure` → Should have 3 secrets

### Via CLI

```bash
# List storefront secrets
infisical secrets --env=development --path=/

# List backend secrets
infisical secrets --env=production --path=/medusa

# List infrastructure secrets
infisical secrets --env=production --path=/infrastructure

# Get specific secret
infisical secrets get NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
  --env=development --path=/
```

---

## Pulling Secrets

Once secrets are in Infisical, pull them to `.env.local`:

```bash
# Pull all development secrets
infisical secrets --env=development --path=/ \
  --format=dotenv > .env.local

# Or use export command
infisical export --env=development --path=/ \
  --format=dotenv > .env.local
```

**Update package.json script**:
```json
{
  "scripts": {
    "secrets:pull": "infisical export --env=development --path=/ --format=dotenv > .env.local"
  }
}
```

Then run:
```bash
pnpm run secrets:pull
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Deploy
on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Infisical CLI
        run: |
          curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
          sudo apt-get update && sudo apt-get install -y infisical

      - name: Export secrets
        env:
          INFISICAL_TOKEN: ${{ secrets.INFISICAL_TOKEN }}
        run: |
          infisical export --env=production --path=/ \
            --format=dotenv > .env.production

      - name: Build
        run: pnpm run build
```

### Vercel Integration

Vercel has native Infisical integration:

1. Vercel Dashboard → Project Settings → Environment Variables
2. Click "Add" → Select "Infisical"
3. Connect Infisical account
4. Select project, environment, and path
5. Auto-syncs secrets

See: https://vercel.com/integrations/infisical

---

## Troubleshooting

### Error: "Infisical CLI not found"

**Solution**:
```bash
# Check installation
which infisical

# If not found, install (see Prerequisites)
```

### Error: "No authentication found"

**Solution**:
```bash
# Option A: Set token
export INFISICAL_TOKEN=st.xxxxx

# Option B: Login interactively
infisical login

# Option C: Already set INFISICAL_SERVICE_TOKEN?
echo $INFISICAL_SERVICE_TOKEN
# Script auto-detects this
```

### Error: "Permission denied"

**Solution**:
```bash
# Make script executable
chmod +x scripts/push-to-infisical.sh
```

### Secrets Not Updating

**Check**:
1. Correct environment and path?
2. Service token has write permissions?
3. Using latest CLI version?

```bash
# Update CLI
brew upgrade infisical  # macOS
# or reinstall for Linux
```

---

## Script Reference

**Location**: `scripts/push-to-infisical.sh`

**Features**:
- ✅ Auto-detects `INFISICAL_TOKEN` or `INFISICAL_SERVICE_TOKEN`
- ✅ Parses `.env.local` automatically
- ✅ Categorizes secrets by destination
- ✅ Skips placeholders (`...`, `REDACTED`)
- ✅ Interactive confirmation
- ✅ Color-coded output
- ✅ Error handling

**Customization**:

Edit the categorization logic if adding new secret types:

```bash
# In push_secrets() function
case "$key" in
    NEXT_PUBLIC_*|MEDUSA_ADMIN_EMAIL|...)
        storefront_secrets+=("$line")
        ;;
    YOUR_NEW_CATEGORY_*)
        your_category_secrets+=("$line")
        ;;
esac
```

---

## Security Best Practices

1. **Never commit `.env.local`**:
   - Already in `.gitignore`
   - Infisical is the source of truth

2. **Rotate secrets regularly**:
   - Use script to push updated values
   - Old values are overwritten

3. **Use environment-specific tokens**:
   - Development: Service token with `development` access
   - Production: Service token with `production` access
   - Limit scope to minimum required paths

4. **Audit access**:
   - Check Infisical audit logs regularly
   - Revoke unused service tokens

---

## Next Steps

1. **Run the script**:
   ```bash
   ./scripts/push-to-infisical.sh
   ```

2. **Verify in web UI**:
   - https://app.infisical.com

3. **Test secret retrieval**:
   ```bash
   pnpm run secrets:pull
   ```

4. **Set up Vercel integration**:
   - Auto-sync secrets to deployments

5. **Configure CI/CD**:
   - Add `INFISICAL_TOKEN` to GitHub Secrets
   - Update workflows to pull secrets

---

**Automation Status**: ✅ Ready to use
**Validation Date**: 2025-11-19
**Script Version**: 1.0
**CLI Version**: 0.43.25+
