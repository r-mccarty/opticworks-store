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

CLAUDE_INSTALLER_URL="https://claude.ai/install.sh"
CLAUDE_ROOT_BIN="/root/.local/bin/claude"
CLAUDE_GLOBAL_BIN="/usr/local/bin/claude"

if command -v claude >/dev/null 2>&1; then
    echo "Claude AI CLI already available."
else
    echo "Installing Claude AI CLI..."
    if sudo bash -c "curl -fsSL ${CLAUDE_INSTALLER_URL} | bash"; then
        echo "Claude AI CLI installer completed."
    else
        echo "WARNING: Failed to run the Claude AI CLI installer. Continuing without blocking the build."
    fi
fi

echo "Ensuring Claude AI CLI is accessible system-wide..."
if sudo test -e "$CLAUDE_ROOT_BIN"; then
    CLAUDE_RESOLVED_PATH=$(sudo readlink -f "$CLAUDE_ROOT_BIN" 2>/dev/null || true)
    if [ -n "$CLAUDE_RESOLVED_PATH" ]; then
        if sudo install -m 0755 "$CLAUDE_RESOLVED_PATH" "$CLAUDE_GLOBAL_BIN"; then
            echo "Claude AI CLI copied to $CLAUDE_GLOBAL_BIN."
        else
            echo "WARNING: Failed to place Claude AI CLI in $CLAUDE_GLOBAL_BIN."
        fi
    else
        echo "WARNING: Unable to resolve the Claude AI CLI target path from $CLAUDE_ROOT_BIN."
    fi
else
    echo "WARNING: Claude AI CLI binary not found in $CLAUDE_ROOT_BIN."
fi

if command -v claude >/dev/null 2>&1; then
    claude --version 2>/dev/null || true
else
    echo "WARNING: Claude AI CLI remains unavailable after the installation attempt."
fi

echo "Ensuring Infisical CLI is installed..."
if ! command -v infisical >/dev/null 2>&1; then
    echo "Installing Infisical CLI from Cloudsmith repository..."
    if curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash && \
       sudo apt-get update && sudo apt-get install -y infisical; then
        echo "Infisical CLI installed successfully."
    else
        echo "WARNING: Failed to install Infisical CLI. Secrets will not be synced automatically."
    fi
else
    echo "Infisical CLI already available ($(infisical --version))."
fi

if command -v infisical >/dev/null 2>&1; then
    if [ -n "${INFISICAL_SERVICE_TOKEN:-}" ] || [ -n "${INFISICAL_TOKEN:-}" ]; then
        echo "Pulling secrets from Infisical..."
        bash scripts/pull-infisical-secrets.sh
    else
        echo "WARNING: INFISICAL_SERVICE_TOKEN (or INFISICAL_TOKEN) environment variable not set. Skipping Infisical secret sync."
    fi
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
