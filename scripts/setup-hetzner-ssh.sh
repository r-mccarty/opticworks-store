#!/usr/bin/env bash
set -euo pipefail

key_value="${HETZNER_VM_SSH_KEY:-}"
if [[ -z "${key_value}" ]]; then
  echo "[hetzner-ssh] HETZNER_VM_SSH_KEY environment variable is not set." >&2
  echo "[hetzner-ssh] Export the secret in your shell or make sure it is injected by Codespaces." >&2
  exit 1
fi

ssh_dir="${HOME}/.ssh"
key_path="${ssh_dir}/hetzner_key"
config_path="${ssh_dir}/config"

mkdir -p "${ssh_dir}"
chmod 700 "${ssh_dir}"

printf '%s\n' "${key_value}" > "${key_path}"
chmod 600 "${key_path}"

touch "${config_path}"
chmod 600 "${config_path}"

CONFIG_PATH="${config_path}" python3 <<'PY'
import os
from pathlib import Path

config_path = Path(os.environ["CONFIG_PATH"])
lines = config_path.read_text().splitlines()
result = []
skip = False
for line in lines:
    if line.startswith("Host "):
        skip = line.strip() == "Host hetzner-node"
    if not skip:
        result.append(line)
config_path.write_text(("\n".join(result).rstrip("\n") + "\n") if result else "")
PY

cat <<'CONFIG' >> "${config_path}"
Host hetzner-node
  HostName 5.78.106.67
  Port 8032
  User ryan
  IdentityFile ~/.ssh/hetzner_key
  StrictHostKeyChecking no
CONFIG

echo "[hetzner-ssh] SSH key written to ${key_path}"
echo "[hetzner-ssh] SSH alias 'hetzner-node' ensured in ${config_path}"
echo "[hetzner-ssh] Test the connection with: ssh hetzner-node \"echo 'Connection successful!'\""
