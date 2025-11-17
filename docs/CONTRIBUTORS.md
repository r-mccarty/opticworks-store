# Contributors Guide

This document outlines infrastructure access and development workflows for contributors to the OpticWorks Presence Intelligence Platform.

## Codespaces Devcontainer

We ship a fully configured devcontainer so contributors can land in a consistent VS Code / Codespaces environment:

- `.devcontainer/devcontainer.json` pins the Node 20 image, forwards the storefront (`3000`) and Hugo docs (`1313`) ports, disables Next telemetry, and syncs common VS Code extensions/settings (ESLint, Prettier, Tailwind, Docker).
- `.devcontainer/Dockerfile` layers Hugo Extended `v0.140.0`, Corepack+pnpm `9.15.3`, `libssl3`, and the tooling the storefront expects (curl, git, OpenSSH) on top of Microsoft’s TypeScript image so OpenSSH/libcrypto always have the right runtime deps.
- `.devcontainer/post-create.sh` runs on container startup to `apt-get` Hugo + Git LFS (so hooks work out of the box), normalize + install the Hetzner SSH key, enable Corepack, install the OpenAI/Gemini/Claude CLIs, configure the Hetzner SSH alias when the `HETZNER_VM_SSH_KEY` secret is present, and finish with `pnpm install` so `pnpm run dev`, `pnpm run lint`, and `pnpm run build` are ready immediately. It also runs `git lfs install` and a smoke `ssh hetzner-node "echo 'hetzner-ssh-ready'"` to confirm connectivity; see `/tmp/hetzner-ssh.log` after container creation for the log.
- Because the post-create script injects the SSH config, you can run `ssh hetzner-node` from a Codespace or local VS Code Remote - Containers session without touching secrets by hand.

Keep these files in sync with any additional tooling expectations so the Codespaces image stays reproducible.

## GitHub Codespaces SSH Access to Hetzner Node

Contributors working in GitHub Codespaces have pre-configured SSH access to the Hetzner development VM for backend development, testing, and service deployment.

### SSH Credentials

- **Server IP**: 5.78.106.67
- **Port**: 8032
- **Username**: ryan
- **Key Type**: ED25519
- **Key Fingerprint**: SHA256:PvzDIOlxe2TSRg62dicEVNVxFzLn9tm7PPtpMvBw6Tg
- **OS**: Debian GNU/Linux (6.12.41+deb13-cloud-amd64)
- **Hostname**: debian-2gb-hil-1-test-instance

### Quick Start

The SSH key is automatically injected into your Codespace via the `HETZNER_VM_SSH_KEY` GitHub secret. An SSH alias is pre-configured in `~/.ssh/config`.

**Connect to the Hetzner node:**
```bash
ssh hetzner-node
```

This is equivalent to:
```bash
ssh -i ~/.ssh/hetzner_key -p 8032 ryan@5.78.106.67
```

### Manual Setup (if needed)

If you need to manually set up SSH access:

1. **Extract the SSH key from the environment:**
   ```bash
   env | grep HETZNER_VM_SSH_KEY
   ```

2. **Save the key with proper permissions (remove any leading whitespace before writing or it will fail with a libcrypto error):**
   ```bash
   mkdir -p ~/.ssh
   python3 - <<'PY'
import os, pathlib, textwrap
key = textwrap.dedent(os.environ["HETZNER_VM_SSH_KEY"]).strip() + "\n"
pathlib.Path.home().joinpath(".ssh", "hetzner_key").write_text(key, encoding="utf-8")
PY
   chmod 600 ~/.ssh/hetzner_key
   ```

3. **Add the SSH alias to `~/.ssh/config`:**
   ```
   Host hetzner-node
     HostName 5.78.106.67
     Port 8032
     User ryan
     IdentityFile ~/.ssh/hetzner_key
     StrictHostKeyChecking no
   ```

4. **Test the connection:**
   ```bash
   ssh hetzner-node "echo 'Connection successful!'"
   ```

### Verified Connectivity

- **Last verified manually**: 2025-11-16 19:35:27 UTC
- **Command**:
  ```bash
  ssh hetzner-node "echo 'connection-ok'"
  ```
- **Result**:
  ```
  connection-ok
  ```

Every Codespace/devcontainer build now also runs:
```bash
ssh -o BatchMode=yes hetzner-node "echo 'hetzner-ssh-ready'"
```
and records the stdout/stderr under `/tmp/hetzner-ssh.log`. Check that file if you need to confirm whether the automated post-create verification succeeded.

If you see `error in libcrypto` when the key loads, make sure the PEM file has no leading spaces (the example Python snippet above handles this automatically) and retry the verification command above.

### SSH Key Configuration Details

The SSH key stored in `HETZNER_VM_SSH_KEY` is:
- Format: OpenSSH private key (ED25519)
- Passphrase: None (used for headless authentication)
- Authorized on server: `/home/ryan/.ssh/authorized_keys`

### Common SSH Operations

**Execute a remote command:**
```bash
ssh hetzner-node "command here"
```

**Copy files to the server:**
```bash
scp -P 8032 -i ~/.ssh/hetzner_key local_file ryan@5.78.106.67:~/
```

**Copy files from the server:**
```bash
scp -P 8032 -i ~/.ssh/hetzner_key ryan@5.78.106.67:~/remote_file ./
```

**Open an interactive shell:**
```bash
ssh hetzner-node
```

### Troubleshooting

**Connection hangs or times out:**
- Check that the Hetzner firewall allows SSH on port 8032
- Verify the server is online and running
- Try connecting with verbose output: `ssh -vvv hetzner-node`

**Permission denied errors:**
- Ensure the SSH key file has correct permissions (600): `chmod 600 ~/.ssh/hetzner_key`
- Verify the key fingerprint matches the expected value above
- Check that the server has your public key in `/home/ryan/.ssh/authorized_keys`

**Key format errors:**
- Ensure the key has proper line breaks (not all on one line)
- The key should start with `-----BEGIN OPENSSH PRIVATE KEY-----` and end with `-----END OPENSSH PRIVATE KEY-----`

### Security Notes

- Never commit the SSH key or `HETZNER_VM_SSH_KEY` secret to the repository
- The SSH key is only available within GitHub Codespaces
- Disable UFW or configure appropriate firewall rules on the Hetzner VM before attempting connections
- The key is intended for development workflows only

### Development vs. Production Access

**Development Access** (SSH - current workflow):
```bash
# Direct SSH for development, testing, and deployment
ssh hetzner-node

# Deploy Medusa backend
ssh hetzner-node "cd /opt/opticworks/medusa-backend && git pull && pnpm install"

# View Medusa logs
ssh hetzner-node "sudo journalctl -u medusa -f"

# Check server status
ssh hetzner-node "uptime && df -h"
```

**Production Access** (Cloudflare Tunnel - Phase 4):

Once Phase 4 is complete, production traffic will flow through Cloudflare Tunnel:
- **Medusa API**: `https://api.optic.works` (via tunnel, no direct IP exposure)
- **Storefront**: `https://optic.works` (Cloudflare Pages)
- **Webhook Buffer**: `https://webhook.optic.works` (Cloudflare Workers)

SSH access will remain for:
- Service management (systemd restart, log inspection)
- Database administration (backups, migrations)
- Infrastructure provisioning (PostgreSQL, Redis, Cloudflared)
- Emergency troubleshooting

**Architecture Diagram**:
```
GitHub Codespaces
    │ SSH (port 8032)
    ↓
Hetzner Node (5.78.106.67)
    ├─ Medusa (localhost:9000) ←─┐
    ├─ PostgreSQL (localhost:5432) │ (development)
    ├─ Redis (localhost:6379)      │
    └─ Cloudflared (tunnel daemon) ┘
              │
              │ HTTPS (production)
              ↓
    Cloudflare Edge
        ├─ api.optic.works → Medusa
        ├─ optic.works → Pages (storefront)
        └─ webhook.optic.works → Workers
```

### Deployment to Hetzner

See `docs/IMPLEMENTATION_GUIDE.md` for complete deployment procedures including:
- Phase 1-3: Direct Medusa deployment via SSH
- Phase 4: Cloudflare Tunnel + Pages production setup
