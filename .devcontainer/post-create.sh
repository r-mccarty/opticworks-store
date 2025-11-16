#!/bin/bash

# This script runs after the container is created, as the 'node' user.
# It sets up system tools, Node.js packages, AI CLIs, and SSH access.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Running Post-Create Script ---"

# --- 1. Install System Packages ---
echo "Updating package lists and installing Hugo + Git LFS..."
sudo apt-get update
sudo apt-get install -y hugo git-lfs

# --- 2. Configure Global Tools & CLIs ---
echo "Configuring Corepack..."
sudo corepack enable

echo "Installing global npm packages (AI CLIs)..."
sudo npm i -g @openai/codex @google/gemini-cli

echo "Installing Claude AI CLI..."
# The installer script is run as root. The '|| true' ensures that if the download fails, the entire build doesn't stop.
sudo bash -c "curl -fsSL https://claude.ai/install.sh | bash" || true

# The installer may place the binary in the root user's local bin.
# This checks for its existence (with sudo so we can read /root) and moves it to /usr/local/bin.
if sudo test -e "/root/.local/bin/claude"; then
    echo "Moving claude binary to /usr/local/bin for system-wide access..."
    sudo install -m 0755 /root/.local/bin/claude /usr/local/bin/claude
else
    echo "WARNING: Claude AI CLI binary not found in its expected location (/root/.local/bin/claude). Skipping move."
fi

# --- 3. Configure SSH Access for Hetzner VM ---
echo "Checking for Hetzner SSH key..."
# This block only runs if the HETZNER_VM_SSH_KEY secret is set in the Codespace.
if [ -n "${HETZNER_VM_SSH_KEY:-}" ]; then
  echo "HETZNER_VM_SSH_KEY secret found. Configuring SSH access..."
  
  # Create the .ssh directory if it doesn't exist
  mkdir -p ~/.ssh
  
  # Normalize the private key (trim indentation/CRLF) before writing to disk.
  python3 <<'PY'
import os
import pathlib
import textwrap

key_raw = os.environ.get("HETZNER_VM_SSH_KEY", "")
key_normalized = textwrap.dedent(key_raw).strip() + "\n"
path = pathlib.Path.home() / ".ssh" / "hetzner_key"
path.write_text(key_normalized, encoding="utf-8")
PY
  chmod 600 ~/.ssh/hetzner_key
  
  # Create or update the SSH config file to add the 'hetzner-node' alias.
  # This check prevents adding duplicate entries on rebuild.
  if ! grep -q 'Host hetzner-node' ~/.ssh/config 2>/dev/null; then
    echo "Adding 'hetzner-node' alias to ~/.ssh/config..."
    printf '%s\n' \
      'Host hetzner-node' \
      '  HostName 5.78.106.67' \
      '  Port 8032' \
      '  User ryan' \
      '  IdentityFile ~/.ssh/hetzner_key' \
      '  UserKnownHostsFile ~/.ssh/known_hosts' \
      '  StrictHostKeyChecking no' \
      >> ~/.ssh/config
  else
    echo "'hetzner-node' alias already exists in ~/.ssh/config."
  fi
  
  echo "Verifying SSH connectivity to hetzner-node..."
  if ssh -o BatchMode=yes -o ConnectTimeout=5 hetzner-node "echo 'hetzner-ssh-ready'" >/tmp/hetzner-ssh.log 2>&1; then
    echo "Hetzner SSH verification succeeded: $(cat /tmp/hetzner-ssh.log)"
  else
    echo "WARNING: Hetzner SSH verification failed. See /tmp/hetzner-ssh.log for details."
  fi
  
  echo "SSH configuration for 'hetzner-node' complete."
else
  echo "WARNING: HETZNER_VM_SSH_KEY secret not found. Skipping SSH setup."
fi

# --- 4. Install Project Dependencies ---
echo "Installing project dependencies with pnpm..."
pnpm install

echo "Initializing Git LFS hooks..."
git lfs install

echo "--- Post-Create Script Finished Successfully ---"
