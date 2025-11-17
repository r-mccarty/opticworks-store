# Infisical Secret Management Setup

**Last updated:** 2025-11-17
**Maintainer:** Platform Engineering
**Status:** Production-ready configuration

## Overview

This guide sets up Infisical as the centralized secret management system for the OpticWorks platform. Infisical replaces manual `.env` file management and provides secure secret sharing, multi-environment support, and audit logging.

**What you'll set up:**
- Infisical organization and project
- Development, staging, and production environments
- All storefront secrets (Stripe, Medusa, Cloudflare, etc.)
- GitHub Codespaces auto-sync
- Local development workflow
- Team member access

**Time required:** 30-45 minutes

---

## Why Infisical?

**Before Infisical:**
- ❌ Manual `.env.local` copy/paste across team
- ❌ Secrets shared via Slack/email (insecure)
- ❌ No audit trail of who accessed what
- ❌ Manual environment variable entry in Cloudflare Pages (30+ variables)
- ❌ Secrets scattered across GitHub Secrets, Vercel, local files

**After Infisical:**
- ✅ Single source of truth for all secrets
- ✅ Automatic sync to Codespaces on creation
- ✅ Secure team sharing with access controls
- ✅ Full audit log of secret access
- ✅ Environment-specific secrets (dev/staging/prod)
- ✅ One-command deployment to Cloudflare Pages
- ✅ Automatic secret rotation support

---

## Prerequisites

✅ OpticWorks GitHub repository access
✅ Admin access to GitHub repository (for Codespaces secrets)
✅ Email address for Infisical account
✅ Stripe account (for API keys)
✅ Medusa backend deployed (Phase 1 complete)

---

## Step 1: Create Infisical Account

### 1.1 Sign Up

1. Go to [Infisical Cloud](https://app.infisical.com/signup)
   - Or self-host: https://infisical.com/docs/self-hosting/overview

2. **Sign up with:**
   - **Option A:** Email + Password
   - **Option B:** GitHub OAuth (recommended - easier team access)
   - **Option C:** Google OAuth

3. **Verify email** if using email signup

**Expected result:** You're logged into the Infisical dashboard

### 1.2 Create Organization

1. Click **Create new organization**
2. **Organization name:** `OpticWorks`
3. Click **Create**

**Expected result:** Organization created, you're now on the Projects page

---

## Step 2: Create Project

### 2.1 Project Setup

1. Click **Create new project**
2. **Project name:** `opticworks-storefront`
3. **Description:** `Next.js storefront + integrations (Stripe, Medusa, Cloudflare)`
4. Click **Create**

**Expected result:** Project created with three default environments:
- Development
- Staging
- Production

### 2.2 Configure Environments (Optional)

For OpticWorks, we'll use:
- **Development** - Local dev + Codespaces
- **Staging** - Preview deployments (future)
- **Production** - Live site (optic.works)

To customize:
1. Click **Settings** → **Environments**
2. You can rename, add, or remove environments
3. Recommended: Keep the defaults for now

---

## Step 3: Add Secrets - Development Environment

### 3.1 Select Development Environment

1. In the project dashboard, select **Development** from the environment dropdown (top left)
2. You should see an empty secrets list

### 3.2 Add Medusa Integration Secrets

Click **Add Secret** and add each of these:

**Medusa Backend (Production):**
```
Name: NEXT_PUBLIC_MEDUSA_ENABLED
Value: true
```

```
Name: NEXT_PUBLIC_MEDUSA_BASE_URL
Value: https://api.optic.works
```

```
Name: NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
Value: pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d
```

> **Note:** These point to production Medusa. For local Medusa testing, you'd use `http://localhost:9000`

### 3.3 Add Stripe Secrets

Get your Stripe keys from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys):

```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

```
Name: STRIPE_SECRET_KEY
Value: sk_test_YOUR_SECRET_KEY_HERE
```

Get webhook secret from [Stripe Webhooks](https://dashboard.stripe.com/test/webhooks):

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_WEBHOOK_SECRET_HERE
```

```
Name: STRIPE_WEBHOOK_SECRET_DEV
Value: whsec_YOUR_DEV_WEBHOOK_SECRET_HERE
```

### 3.4 Add Cloudflare Secrets

Get these from your [Cloudflare Dashboard](https://dash.cloudflare.com/):

**R2 Storage:**
1. Go to R2 → Manage R2 API tokens
2. Create token with read/write permissions

```
Name: R2_ACCESS_KEY_ID
Value: YOUR_R2_ACCESS_KEY
```

```
Name: R2_SECRET_ACCESS_KEY
Value: YOUR_R2_SECRET_KEY
```

```
Name: R2_BUCKET_NAME
Value: opticworks-assets
```

```
Name: R2_ENDPOINT_URL
Value: https://<account_id>.r2.cloudflarestorage.com
```

```
Name: R2_PUBLIC_URL
Value: https://assets.optic.works
```

**Cloudflare API:**

Get from: Profile → API Tokens

```
Name: CLOUDFLARE_ACCOUNT_ID
Value: YOUR_ACCOUNT_ID
```

```
Name: CLOUDFLARE_EMAIL
Value: your-email@domain.com
```

```
Name: CLOUDFLARE_GLOBAL_API_KEY
Value: YOUR_GLOBAL_API_KEY
```

```
Name: CLOUDFLARE_API_BASE_URL
Value: https://api.cloudflare.com/client/v4
```

### 3.5 Add Email/Communication Secrets

**Resend (Email):**

Get from [Resend Dashboard](https://resend.com/api-keys):

```
Name: RESEND_API_KEY
Value: re_YOUR_RESEND_API_KEY
```

```
Name: NEXT_PUBLIC_FROM_EMAIL
Value: noreply@optic.works
```

### 3.6 Add Optional Integration Secrets

**EasyPost (Shipping - Optional):**

```
Name: EASYPOST_API_KEY
Value: EZAK_YOUR_KEY (leave empty if not using yet)
```

**Analytics (Optional):**

```
Name: NEXT_PUBLIC_GA_MEASUREMENT_ID
Value: G-XXXXXXXXXX (leave empty if not using yet)
```

### 3.7 Add Application Configuration

```
Name: NODE_ENV
Value: development
```

```
Name: NEXT_PUBLIC_APP_URL
Value: http://localhost:3000
```

### 3.8 Verify All Secrets Added

Your Development environment should now have approximately **20-25 secrets**. You can view them in the Infisical dashboard.

**Quick checklist:**
- [ ] Medusa integration (3 secrets)
- [ ] Stripe (4 secrets)
- [ ] Cloudflare R2 (5 secrets)
- [ ] Cloudflare API (4 secrets)
- [ ] Resend email (2 secrets)
- [ ] App config (2 secrets)

---

## Step 4: Add Secrets - Production Environment

### 4.1 Switch to Production Environment

1. Click the environment dropdown (top left)
2. Select **Production**

### 4.2 Copy Development Secrets

Most secrets are the same across environments. The main differences:

**Production-specific values:**

```
Name: NODE_ENV
Value: production
```

```
Name: NEXT_PUBLIC_APP_URL
Value: https://optic.works
```

**Stripe Production Keys:**

Switch to [Stripe Live Mode](https://dashboard.stripe.com/apikeys):

```
Name: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_YOUR_LIVE_PUBLISHABLE_KEY
```

```
Name: STRIPE_SECRET_KEY
Value: sk_live_YOUR_LIVE_SECRET_KEY
```

```
Name: STRIPE_WEBHOOK_SECRET
Value: whsec_YOUR_LIVE_WEBHOOK_SECRET
```

**All other secrets:** Same as Development

> **Tip:** Use Infisical's "Copy to Environment" feature:
> 1. Go back to Development
> 2. Click the **•••** menu on a secret
> 3. Select **Copy to other environments**
> 4. Choose **Production**
> 5. Modify the production-specific values after copying

---

## Step 5: Create Service Token for Codespaces

### 5.1 Navigate to Service Tokens

1. In your project, click **Settings** (left sidebar)
2. Click **Service Tokens** tab
3. Click **Create service token**

### 5.2 Configure Token

**Token Configuration:**

| Field | Value |
|-------|-------|
| **Name** | `GitHub Codespaces Development` |
| **Environment** | `Development` |
| **Expiration** | `Never` or `1 year` |
| **Permissions** | `Read` |

Click **Create**

### 5.3 Copy Service Token

**IMPORTANT:** Copy the token immediately - you won't see it again!

The token will look like:
```
st.dev.1234567890abcdef.1234567890abcdef1234567890abcdef
```

**Save this securely** - you'll need it in the next step.

---

## Step 6: Configure GitHub Codespaces

### 6.1 Add Infisical Token to GitHub Secrets

1. Go to your GitHub repository: `https://github.com/r-mccarty/opticworks-store`
2. Click **Settings** (repository settings, not your account)
3. In left sidebar: **Secrets and variables** → **Codespaces**
4. Click **New repository secret**

**Secret Configuration:**

| Field | Value |
|-------|-------|
| **Name** | `INFISICAL_TOKEN` |
| **Secret** | Paste the service token from Step 5.3 |

5. Click **Add secret**

### 6.2 Verify Codespaces Configuration

Your repository already has the necessary configuration in `.devcontainer/devcontainer.json`:

```json
{
  "containerEnv": {
    "INFISICAL_TOKEN": "${localEnv:INFISICAL_TOKEN}"
  }
}
```

And `.devcontainer/postCreateCommand.sh` will automatically:
1. Install Infisical CLI
2. Run `infisical export --env=development > .env.local`
3. Sync secrets on Codespace creation

### 6.3 Test Codespaces Auto-Sync

**Option A: Create New Codespace**

1. Go to your repository on GitHub
2. Click **Code** → **Codespaces** → **Create codespace on main**
3. Wait for Codespace to build (~2-3 minutes)
4. When ready, check the terminal output for:
   ```
   ✅ Infisical secrets synced to .env.local
   ```
5. Verify secrets:
   ```bash
   cat .env.local
   # Should show all your secrets from Infisical
   ```

**Option B: Rebuild Existing Codespace**

1. In your current Codespace
2. Press `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
3. Type: `Codespaces: Rebuild Container`
4. Wait for rebuild (~1-2 minutes)
5. Verify as above

**Expected result:** `.env.local` file automatically created with all secrets from Infisical Development environment.

---

## Step 7: Local Development Setup

For development outside of Codespaces (local machine):

### 7.1 Install Infisical CLI

**macOS:**
```bash
brew install infisical/get-cli/infisical
```

**Windows:**
```powershell
scoop bucket add infisical https://github.com/Infisical/scoop-infisical.git
scoop install infisical
```

**Linux:**
```bash
curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
sudo apt-get update && sudo apt-get install -y infisical
```

**Verify installation:**
```bash
infisical --version
# Should show: Infisical vX.X.X
```

### 7.2 Login to Infisical

```bash
infisical login
```

This will:
1. Open browser for authentication
2. Log in with your Infisical account
3. Store credentials locally in `~/.infisical.json`

### 7.3 Link Project

Navigate to your project directory:

```bash
cd /path/to/opticworks-store
infisical init
```

Follow the prompts:
1. Select organization: `OpticWorks`
2. Select project: `opticworks-storefront`
3. Select environment: `Development`

This creates `.infisical.json` in your project root (already in `.gitignore`).

### 7.4 Pull Secrets

```bash
infisical export --env=development > .env.local
```

Or use the npm script:

```bash
pnpm run secrets:pull
```

**Expected result:** `.env.local` created with all secrets from Infisical.

### 7.5 Verify Secrets

```bash
cat .env.local | grep MEDUSA
# Should show:
# NEXT_PUBLIC_MEDUSA_ENABLED=true
# NEXT_PUBLIC_MEDUSA_BASE_URL=https://api.optic.works
# etc.
```

---

## Step 8: Team Member Onboarding

### 8.1 Invite Team Member to Infisical

1. In Infisical, click **Settings** → **Members**
2. Click **Invite member**
3. Enter their email address
4. Select role:
   - **Admin** - Can manage all settings
   - **Developer** - Can read/write secrets
   - **Viewer** - Read-only access
5. Click **Send invitation**

**They'll receive an email** with invitation link.

### 8.2 Team Member Setup

**After accepting invitation:**

1. **Install Infisical CLI** (Step 7.1 above)
2. **Login:**
   ```bash
   infisical login
   ```
3. **Clone repository:**
   ```bash
   git clone https://github.com/r-mccarty/opticworks-store.git
   cd opticworks-store
   ```
4. **Initialize Infisical:**
   ```bash
   infisical init
   # Select: OpticWorks → opticworks-storefront → Development
   ```
5. **Pull secrets:**
   ```bash
   pnpm run secrets:pull
   ```
6. **Start development:**
   ```bash
   pnpm install
   pnpm run dev
   ```

**That's it!** No manual secret sharing needed.

---

## Step 9: CI/CD Integration

### 9.1 Create Production Service Token

For production deployments (Cloudflare Pages, etc.):

1. **Settings** → **Service Tokens** → **Create service token**
2. **Name:** `Cloudflare Pages Production`
3. **Environment:** `Production`
4. **Expiration:** `1 year`
5. **Permissions:** `Read`
6. Copy the token: `st.prod.xxxxx...`

### 9.2 Add to Cloudflare Pages (When Deploying)

When you deploy to Cloudflare Pages in Phase 4:

1. Go to Cloudflare Pages project settings
2. **Settings** → **Environment variables**
3. Add one variable:
   ```
   INFISICAL_TOKEN=st.prod.xxxxx...
   ```

4. In your build command, add:
   ```bash
   infisical export --env=production --format=dotenv > .env.production.local && next build
   ```

This automatically injects all production secrets during build.

### 9.3 GitHub Actions (Optional)

If using GitHub Actions for CI/CD:

1. Add secret to GitHub repo: **Settings** → **Secrets and variables** → **Actions**
2. Name: `INFISICAL_TOKEN_PROD`
3. Value: Production service token

In your workflow:

```yaml
- name: Pull Infisical secrets
  run: |
    curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash
    sudo apt-get update && sudo apt-get install -y infisical
    infisical export --env=production --token=${{ secrets.INFISICAL_TOKEN_PROD }} --format=dotenv > .env.production.local
```

---

## Step 10: Secret Management Best Practices

### 10.1 Rotation Schedule

**Recommended rotation frequency:**

| Secret Type | Rotation Frequency |
|------------|-------------------|
| **Stripe API keys** | Annually or on breach |
| **Cloudflare API tokens** | Quarterly |
| **Medusa admin tokens** | Quarterly |
| **Infisical service tokens** | Annually |
| **Database passwords** | Semi-annually |

**To rotate a secret:**

1. Generate new key in the service (Stripe, Cloudflare, etc.)
2. Update value in Infisical (all environments)
3. Deploy/redeploy applications (will pick up new value)
4. Verify new key works
5. Revoke old key in the service

### 10.2 Access Control

**Principle of least privilege:**

- **Developers:** Development environment only
- **DevOps:** All environments, read-only
- **Platform Leads:** All environments, read-write
- **Contractors:** Specific secrets only (use folders)

**To restrict access:**

1. **Settings** → **Members** → Click member
2. Edit **Environment access**
3. Select specific environments
4. Save

### 10.3 Audit Logging

**Monitor secret access:**

1. **Activity** tab in Infisical project
2. See all secret reads, updates, deletions
3. Filter by user, environment, or date
4. Export logs for compliance

**Review logs monthly** for:
- Unexpected access patterns
- Deleted secrets
- Failed access attempts
- New service tokens created

### 10.4 Secret Organization

**Use folders for clarity:**

1. In Infisical, click **Create folder**
2. Group secrets logically:
   ```
   /stripe
     - STRIPE_SECRET_KEY
     - STRIPE_WEBHOOK_SECRET
   /cloudflare
     - R2_ACCESS_KEY_ID
     - R2_SECRET_ACCESS_KEY
   /medusa
     - MEDUSA_BASE_URL
     - MEDUSA_PUBLISHABLE_KEY
   ```

This makes it easier to:
- Grant access to specific integrations
- Rotate related secrets together
- Onboard new team members

---

## Troubleshooting

### Issue: "INFISICAL_TOKEN not found" in Codespaces

**Cause:** GitHub secret not configured or Codespace created before secret was added

**Fix:**
1. Verify secret exists: GitHub repo → Settings → Secrets → Codespaces
2. Name must be exactly: `INFISICAL_TOKEN`
3. Rebuild Codespace: `Cmd+Shift+P` → "Codespaces: Rebuild Container"

### Issue: "Authentication failed" when running `infisical login`

**Cause:** CLI not installed correctly or Infisical service down

**Fix:**
1. Verify CLI installed: `infisical --version`
2. Reinstall CLI (see Step 7.1)
3. Check Infisical status: https://status.infisical.com/
4. Clear credentials: `rm ~/.infisical.json` and re-login

### Issue: ".env.local is empty or missing secrets"

**Cause:** Wrong environment selected or export command failed

**Fix:**
1. Check current environment: `cat .infisical.json`
2. Re-run init: `infisical init` and select correct environment
3. Re-export: `infisical export --env=development > .env.local`
4. Verify secrets exist in Infisical dashboard

### Issue: "Secret X not found" errors when running app

**Cause:** Secret name mismatch between Infisical and code

**Fix:**
1. Check exact secret names in code (grep for process.env)
2. Ensure Infisical secret names match exactly (case-sensitive)
3. Re-pull secrets: `pnpm run secrets:pull`
4. Restart dev server

### Issue: Service token expired

**Cause:** Token created with expiration date that has passed

**Fix:**
1. Go to Infisical → Settings → Service Tokens
2. Delete expired token
3. Create new token (Step 5)
4. Update GitHub secret or CI/CD configuration
5. Rebuild/redeploy

---

## Advanced: Self-Hosting Infisical

For enterprise deployments or stricter compliance requirements:

### Benefits of Self-Hosting

- Full data sovereignty
- Custom compliance policies
- Integration with internal SSO
- No external dependencies

### Quick Self-Host Setup

**Using Docker Compose:**

```bash
# Clone Infisical
git clone https://github.com/Infisical/infisical.git
cd infisical

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

**Access at:** `http://localhost:80`

**See:** https://infisical.com/docs/self-hosting/overview for full guide

---

## Migration from Manual .env Management

If you have existing `.env.local` files:

### 1. Extract Secrets

```bash
# Parse existing .env.local
cat .env.local | grep -v '^#' | grep -v '^$' > secrets.txt
```

### 2. Import to Infisical

**Option A: Manual (Small number of secrets)**

Copy/paste each secret from `secrets.txt` into Infisical dashboard.

**Option B: CLI Bulk Import (Many secrets)**

```bash
# Format as JSON
cat secrets.txt | awk -F= '{printf "{\"key\": \"%s\", \"value\": \"%s\"},\n", $1, $2}' > secrets.json

# Import using Infisical API (requires API token)
curl -X POST https://app.infisical.com/api/v2/secrets/batch \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d @secrets.json
```

### 3. Verify and Delete Local Files

```bash
# Pull from Infisical
infisical export --env=development > .env.local.new

# Compare
diff .env.local .env.local.new

# If identical, delete old file
rm .env.local
mv .env.local.new .env.local
```

---

## Security Checklist

Before going live:

- [ ] All production secrets added to Infisical Production environment
- [ ] Development uses test/sandbox API keys (Stripe, etc.)
- [ ] Production uses live API keys
- [ ] Service tokens have appropriate expiration dates
- [ ] Team members have least-privilege access
- [ ] Audit logging enabled and monitored
- [ ] `.env.local` and `.infisical.json` in `.gitignore`
- [ ] No secrets committed to Git history
- [ ] Backup/recovery plan documented
- [ ] Rotation schedule established
- [ ] Cloudflare Pages configured with production token
- [ ] GitHub Codespaces secret configured
- [ ] Local development tested and working

---

## Quick Reference

### Common Commands

```bash
# Login
infisical login

# Initialize project
infisical init

# Pull secrets (development)
infisical export --env=development > .env.local

# Pull secrets (production)
infisical export --env=production > .env.production.local

# Use secrets:pull script
pnpm run secrets:pull

# View current environment
cat .infisical.json

# Run command with secrets injected
infisical run --env=development -- pnpm run dev
```

### Service Token Locations

| Use Case | Token Location | Format |
|----------|---------------|--------|
| **Codespaces** | GitHub repo → Settings → Secrets → Codespaces → `INFISICAL_TOKEN` | `st.dev.xxxxx` |
| **Cloudflare Pages** | Cloudflare Pages → Settings → Environment variables → `INFISICAL_TOKEN` | `st.prod.xxxxx` |
| **GitHub Actions** | GitHub repo → Settings → Secrets → Actions → `INFISICAL_TOKEN_PROD` | `st.prod.xxxxx` |

### Environment Mapping

| Environment | Use Case | Key Differences |
|------------|----------|----------------|
| **Development** | Codespaces, local dev | Test Stripe keys, localhost URLs |
| **Staging** | Preview deployments | Test keys, staging URLs |
| **Production** | Live site | Live Stripe keys, optic.works URLs |

---

## Support Resources

**Infisical Documentation:**
- General: https://infisical.com/docs
- CLI: https://infisical.com/docs/cli/overview
- Service Tokens: https://infisical.com/docs/documentation/platform/token

**OpticWorks Team:**
- Platform Engineering: [contact]
- Infisical Admin: [admin-email]

**Community:**
- Infisical Discord: https://infisical.com/slack
- GitHub Issues: https://github.com/Infisical/infisical/issues

---

## Appendix: Complete Secret List

For reference, here are all secrets needed for the OpticWorks storefront:

### Medusa Integration
```
NEXT_PUBLIC_MEDUSA_ENABLED
NEXT_PUBLIC_MEDUSA_BASE_URL
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
MEDUSA_API_TOKEN (optional, for admin scripts)
MEDUSA_ADMIN_TOKEN (optional, for admin scripts)
```

### Stripe
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_WEBHOOK_SECRET_DEV
```

### Cloudflare R2
```
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_BUCKET_NAME
R2_ENDPOINT_URL
R2_PUBLIC_URL
```

### Cloudflare API
```
CLOUDFLARE_ACCOUNT_ID
CLOUDFLARE_EMAIL
CLOUDFLARE_GLOBAL_API_KEY
CLOUDFLARE_API_BASE_URL
CLOUDFLARE_IMAGES_TOKEN
```

### Email
```
RESEND_API_KEY
NEXT_PUBLIC_FROM_EMAIL
```

### Optional Integrations
```
EASYPOST_API_KEY
NEXT_PUBLIC_GA_MEASUREMENT_ID
GOOGLE_CLOUD_PROJECT
GA4_PROPERTY_ID
CONTEXT7_API_KEY
GEMINI_API_KEY
```

### Application Config
```
NODE_ENV
NEXT_PUBLIC_APP_URL
```

**Total:** ~30 secrets

---

**Questions or need help?** Contact Platform Engineering or check the troubleshooting section above.
