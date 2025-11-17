# Cloudflare Access Setup for Medusa Admin Dashboard

**Last updated:** 2025-11-17
**Maintainer:** Platform Engineering
**Status:** Production-ready configuration

## Overview

This guide configures Cloudflare Access (Zero Trust) to protect the Medusa admin dashboard at `https://api.optic.works/app` with authentication, while keeping the Store API and health endpoints public.

**What you'll set up:**
- Zero Trust application for `/app*` (admin dashboard)
- Email-based authentication (upgradeable to SSO later)
- Audit logging and session management
- Public access for `/health` and `/store/*`

**Time required:** 10-15 minutes

---

## Prerequisites

✅ Cloudflare account with `optic.works` domain
✅ Medusa backend running at `api.optic.works` (Phase 1 complete)
✅ Admin email address(es) for access control

---

## Step 1: Access Cloudflare Zero Trust Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account (top left dropdown)
3. In the left sidebar, click **Zero Trust**
   - If you don't see it, click **Products** → **Zero Trust**
   - URL: `https://one.dash.cloudflare.com/`

4. **First-time setup only:**
   - If prompted, click **Create a team**
   - Team name: `opticworks` (or your preference - this will be your Zero Trust subdomain)
   - This creates: `opticworks.cloudflareaccess.com`
   - Click **Next** through the setup wizard

**Expected result:** You should see the Zero Trust dashboard with sidebar options: Access, Gateway, Logs, etc.

---

## Step 2: Create Access Application for Admin Dashboard

### 2.1 Start Application Creation

1. In Zero Trust dashboard sidebar: **Access** → **Applications**
2. Click **Add an application**
3. Select **Self-hosted** (not SaaS)

### 2.2 Configure Application Details

**Application Configuration tab:**

| Field | Value |
|-------|-------|
| **Application name** | `Medusa Admin Dashboard` |
| **Session Duration** | `24 hours` |

**Application domain (in the "Add a domain" section):**

| Field | Value |
|-------|-------|
| **Subdomain** | `api` |
| **Domain** | Select `optic.works` from dropdown |
| **Path** | `/app*` |

> **Important:** The asterisk (`*`) in `/app*` protects all admin routes like `/app/products`, `/app/settings`, etc.

**Application appearance (optional - customize if desired):**

| Field | Value |
|-------|-------|
| **App Launcher visibility** | `Visible` (shows in Cloudflare Access App Launcher) |
| **App logo** | Upload OpticWorks logo (optional) |
| **Background color** | `#1a1a1a` or your brand color |

### 2.3 Additional settings (keep defaults)

- **Enable automatic cloudflared authentication:** `Disabled` (we're using Cloudflare Tunnel already)
- **Browser rendering:** `Default` (SSH and VNC not needed)

Click **Next** to proceed to policies.

---

## Step 3: Configure Access Policy

### 3.1 Create Allow Policy

**Policy name:** `Admin Team Members`

**Action:** `Allow`

**Session duration:** `Same as application` (24 hours)

### 3.2 Configure Include Rules

**Choose your authentication method:**

#### Option A: Email-based (Recommended for start)

1. Click **Add include** under "Configure rules"
2. **Selector:** `Emails`
3. **Value:** Enter admin email(s):
   ```
   your-email@domain.com
   ```
   - Click **Add** to add more emails
   - Each email gets a One-Time PIN (OTP) sent when they log in

#### Option B: Email Domain (Team-wide)

1. Click **Add include**
2. **Selector:** `Emails ending in`
3. **Value:** `@yourdomain.com`
   - Allows any email from your company domain
   - Requires you to verify domain ownership (Cloudflare will guide you)

#### Option C: External Identity Provider (Most Secure)

**First, set up an identity provider:**

1. Go back to **Settings** → **Authentication** → **Login methods**
2. Click **Add new**
3. Select your provider:
   - **Google Workspace** (easiest for Gmail/Google Workspace)
   - **Azure AD** (for Microsoft 365)
   - **Okta**, **GitHub**, **LinkedIn**, etc.
4. Follow the provider-specific setup (Cloudflare provides guided steps)

**Then create the policy rule:**

1. **Selector:** `Emails`
2. **Value:** Your email from the IdP
3. Or use **Selector:** `Emails ending in @yourdomain.com`

### 3.3 Optional: Require Additional Criteria

Add more security layers (optional but recommended):

**Add a Require rule:**

1. Click **Add require**
2. Examples:
   - **Country:** `United States` (restrict by location)
   - **IP ranges:** `1.2.3.4/32` (restrict to office IP)
   - **Device posture:** Require managed device (needs Cloudflare WARP client)

### 3.4 Review Policy Summary

Your policy should look like:

```
Allow if:
  - Email is in: [your-email@domain.com]

Session duration: 24 hours
```

Click **Next**.

---

## Step 4: Review and Deploy

### 4.1 Review Summary

You should see:

```
Application: Medusa Admin Dashboard
Domain: https://api.optic.works/app*
Policies: 1 policy (Admin Team Members)
```

### 4.2 Add Application

Click **Add application**

**Expected result:**
- Success message appears
- Application listed in Access → Applications
- Status: Active

---

## Step 5: (Optional) Keep Public Endpoints Accessible

By default, Cloudflare Access only protects the paths you specify. The health and store endpoints remain public. To make this explicit:

### Option A: Do Nothing (Recommended)

Paths not protected by Access policies remain public:
- ✅ `/health` - Public (for uptime monitoring)
- ✅ `/store/*` - Public (for storefront API)
- 🔒 `/app*` - Protected by Access

### Option B: Explicitly Document with Bypass Policy

If you want to be explicit in the dashboard:

1. Click **Add an application** again
2. **Application name:** `Public Endpoints`
3. **Domain:** `api.optic.works`
4. **Path:** `/health` (create separate apps for each public path if desired)
5. **Policy:**
   - Name: `Public Access`
   - Action: `Bypass`
   - Include: `Everyone`
6. Repeat for `/store*` if desired

This documents which endpoints are intentionally public.

---

## Step 6: Test the Configuration

### 6.1 Test Protected Access

1. Open an **incognito/private browser window**
2. Navigate to: `https://api.optic.works/app`

**Expected flow:**

1. **Cloudflare Access login screen appears:**
   ```
   Sign in to Medusa Admin Dashboard
   [Enter your email]
   ```

2. **Enter your email** (the one you added to the policy)

3. **Email authentication:**
   - If using email method: Check your email for a 6-digit PIN
   - If using IdP: Redirected to Google/Microsoft/etc. login

4. **Enter PIN or complete IdP login**

5. **Success:** Redirected to Medusa admin dashboard

6. **No re-authentication needed** for 24 hours (based on session duration)

### 6.2 Test Public Endpoints

In the same or different browser:

```bash
# Health check should work without authentication
curl https://api.optic.works/health
# Expected: OK

# Store API should work with publishable key
curl -H "x-publishable-api-key: pk_opticworks_2025_live_c9fa7e3575be7d2fc8082e3d088bcf5d" \
  https://api.optic.works/store/products
# Expected: {"products": [], "count": 0, ...}
```

**Expected result:** Both endpoints return data without authentication prompts.

---

## Step 7: Configure Session & Security Settings

### 7.1 Session Management

1. Go to **Access** → **Applications**
2. Click **Edit** on "Medusa Admin Dashboard"
3. Scroll to **Session management**

**Recommended settings:**

| Setting | Value | Reason |
|---------|-------|--------|
| **Session duration** | `12 hours` or `24 hours` | Balance security vs. convenience |
| **Idle timeout** | `4 hours` | Auto-logout after inactivity |
| **Refresh sessions** | `Enabled` | Seamless re-authentication |

### 7.2 Additional Security

**Enable these for production:**

1. **Instant Auth**
   - Go to **Settings** → **Authentication**
   - Enable **Require WARP** (optional - requires Cloudflare WARP client on devices)

2. **Purpose Justification** (optional)
   - In the Access policy, click **Edit**
   - Enable **Purpose justification**
   - Users must explain why they need access before entering

3. **Approved Devices Only** (advanced)
   - Set up device posture checks (requires MDM integration)

---

## Step 8: Add Team Members

### 8.1 Add New Emails to Policy

1. Go to **Access** → **Applications**
2. Click **Edit** on "Medusa Admin Dashboard"
3. Click **Edit** on the policy
4. Under **Include** rules:
   - Click **Add** next to the email field
   - Enter new team member email
   - Click **Save**

### 8.2 Send Access Instructions

Email new team members:

```
Subject: Access to OpticWorks Medusa Admin

You've been granted access to the OpticWorks admin dashboard.

To access:
1. Go to https://api.optic.works/app
2. Enter your email: [their-email@domain.com]
3. Check your email for a 6-digit PIN
4. Enter the PIN to complete login

You'll stay logged in for 24 hours on this device.

Questions? Contact [your-contact]
```

---

## Step 9: Monitor Access Logs

### 9.1 View Access Attempts

1. Go to **Logs** → **Access**
2. You'll see:
   - All authentication attempts (success/failure)
   - User email, timestamp, location, device
   - Blocked attempts (wrong email, expired session, etc.)

### 9.2 Set Up Alerts (Optional)

1. Go to **Notifications**
2. Create alert for:
   - Failed login attempts (>5 in 10 minutes)
   - New device logins
   - Access from unexpected countries

---

## Troubleshooting

### Issue: "Access Denied" for Valid Email

**Cause:** Email not in policy or typo in email address

**Fix:**
1. Go to **Access** → **Applications** → **Medusa Admin Dashboard** → **Edit**
2. Click **Edit** on the policy
3. Verify email is listed exactly under **Include** rules
4. Check for typos (case-sensitive)

### Issue: PIN Email Not Received

**Cause:** Email in spam or Cloudflare email delivery issue

**Fix:**
1. Check spam/junk folder
2. Add `no-reply@cloudflareaccess.com` to contacts
3. Try again after 1 minute (rate limit)
4. Use a different email if persistent

### Issue: "Session Expired" Too Quickly

**Cause:** Idle timeout or session duration too short

**Fix:**
1. Edit application → **Session management**
2. Increase **Session duration** to 24 hours
3. Increase **Idle timeout** to 4-8 hours

### Issue: Public Endpoints (Store API) Blocked

**Cause:** Overly broad Access policy path

**Fix:**
1. Edit application
2. Verify **Path** is exactly `/app*` (not `/` or `/*`)
3. Remove any conflicting applications that protect `/store*`

### Issue: Can't Access from Mobile

**Cause:** Cookie/session issues on mobile browser

**Fix:**
1. Use full browser (Safari/Chrome), not in-app browser
2. Allow cookies for `cloudflareaccess.com`
3. Consider switching to IdP authentication (easier on mobile)

---

## Upgrading to Identity Provider (SSO)

When you're ready to move from email PIN to SSO:

### Google Workspace Setup

1. Go to **Settings** → **Authentication** → **Login methods**
2. Click **Add new** → **Google Workspace**
3. Follow Cloudflare's guided setup:
   - Copy OAuth credentials from Google Cloud Console
   - Set authorized redirect URI
   - Test login
4. Update Access policy:
   - Change **Selector** to `Emails ending in @yourdomain.com`
   - Or keep specific emails

### Azure AD / Microsoft 365 Setup

1. Go to **Settings** → **Authentication** → **Login methods**
2. Click **Add new** → **Azure AD**
3. Follow guided setup in Azure portal
4. Update policy as above

**Benefits of IdP:**
- No PIN emails needed
- Centralized user management
- MFA/2FA from IdP carries over
- Single sign-on across all Cloudflare apps

---

## Production Checklist

Before going live, verify:

- [ ] Access application created and active
- [ ] Policy includes all admin emails
- [ ] Session duration set appropriately (12-24 hours)
- [ ] Tested login from incognito window (success)
- [ ] Verified `/health` and `/store/*` remain public
- [ ] Access logs show successful authentication
- [ ] Team members can access dashboard
- [ ] PIN emails arrive promptly
- [ ] Session persists across page reloads
- [ ] Logout works correctly
- [ ] Documentation updated with new login flow

---

## Next Steps

After setup:

1. **Document access for team:**
   - Update onboarding docs with login flow
   - Share Access URL: `https://api.optic.works/app`

2. **Monitor usage:**
   - Review Access logs weekly
   - Check for unauthorized attempts
   - Audit team member list quarterly

3. **Plan IdP migration:**
   - Evaluate Google Workspace, Azure AD, or Okta
   - Schedule migration when team > 5 members
   - Less email fatigue, better security

4. **Consider device posture:**
   - Require Cloudflare WARP for access
   - Enforce device compliance rules
   - Block unmanaged devices

---

## Reference

**Documentation:**
- [Cloudflare Access Documentation](https://developers.cloudflare.com/cloudflare-one/applications/configure-apps/)
- [Policy configuration](https://developers.cloudflare.com/cloudflare-one/policies/access/)
- [IdP integrations](https://developers.cloudflare.com/cloudflare-one/identity/idp-integration/)

**Support:**
- Cloudflare Community: https://community.cloudflare.com/c/security/access/
- Cloudflare Support: https://support.cloudflare.com/

**OpticWorks Contact:**
- Platform Engineering: [your-contact]
- Escalations: [escalation-contact]

---

## Appendix: Environment Variables

After setup, add to your team's environment documentation:

```bash
# Cloudflare Access (for scripts/automation)
CLOUDFLARE_TEAM_NAME=opticworks
CLOUDFLARE_ACCESS_URL=https://api.optic.works/app
CLOUDFLARE_ACCESS_CLIENT_ID=<from_service_token>  # If using service tokens
CLOUDFLARE_ACCESS_CLIENT_SECRET=<from_service_token>
```

**Service tokens** allow non-interactive access (e.g., CI/CD, monitoring tools). Set up at:
**Access** → **Service Auth** → **Service Tokens**

---

**Questions or issues?** Check the Troubleshooting section above or contact Platform Engineering.
