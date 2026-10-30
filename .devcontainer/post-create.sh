#!/bin/bash

# This script runs after the container is created, as the 'node' user.
# It sets up system tools, Node.js packages and AI CLIs.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "--- Running Post-Create Script ---"

# --- 1. Install System Packages ---
echo "Updating package lists and installing Git LFS..."
sudo apt-get update
sudo apt-get install -y git-lfs

# --- 2. Configure Global Tools & CLIs ---
echo "Configuring Corepack..."
sudo corepack enable

echo "Installing global npm packages (AI CLIs)..."
sudo npm i -g @openai/codex @google/gemini-cli

# Install Claude Code CLI for the current user (not root).
# This installs to ~/.local/bin/claude which is already in PATH.
CLAUDE_INSTALLER_URL="https://claude.ai/install.sh"

echo "Installing Claude Code CLI..."
if curl -fsSL "$CLAUDE_INSTALLER_URL" | bash; then
    echo "Claude Code CLI installed successfully."
    claude --version 2>/dev/null || true
else
    echo "WARNING: Failed to install Claude Code CLI. Continuing without blocking the build."
fi

# --- 3. Install Project Dependencies ---
echo "Installing project dependencies with pnpm..."
pnpm install

echo "Initializing Git LFS hooks..."
git lfs install

echo "--- Post-Create Script Finished Successfully ---"
