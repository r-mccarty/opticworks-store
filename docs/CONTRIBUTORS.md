# Contributors Guide

This document outlines infrastructure access and development workflows for contributors to the OpticWorks Presence Intelligence Platform.

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

2. **Save the key with proper permissions:**
   ```bash
   mkdir -p ~/.ssh
   echo "$HETZNER_VM_SSH_KEY" > ~/.ssh/hetzner_key
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

### Deployment to Hetzner

Once connected, you can deploy services, run tests, and manage the development infrastructure:

```bash
# Check server status
ssh hetzner-node "uptime && df -h"

# Deploy services (example)
ssh hetzner-node "cd ~/solar-saas && git pull && pnpm install && pnpm run build"

# View logs
ssh hetzner-node "tail -f /var/log/service.log"
```

See `docs/IMPLEMENTATION_GUIDE.md` for service-specific deployment procedures.
