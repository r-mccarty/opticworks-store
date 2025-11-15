#!/usr/bin/env bash
set -euo pipefail

log() {
  printf '[hetzner-debug] %s\n' "$*"
}

HOST_IP="5.78.106.67"
HOST_PORT="8032"
HOST_USER="ryan"
SSH_ALIAS="hetzner-node"
SSH_DIR="${HOME}/.ssh"
KEY_PATH="${SSH_DIR}/hetzner_key"
CONFIG_PATH="${SSH_DIR}/config"

secret_present="false"
if [[ -n "${HETZNER_VM_SSH_KEY:-}" ]]; then
  secret_present="true"
  log "HETZNER_VM_SSH_KEY is available in the environment (length: ${#HETZNER_VM_SSH_KEY})."
else
  log "HETZNER_VM_SSH_KEY is not present in this shell environment."
fi

if [[ -f "${KEY_PATH}" ]]; then
  log "Private key already exists at ${KEY_PATH}."
else
  log "Private key missing at ${KEY_PATH}."
  if [[ "${secret_present}" == "true" ]]; then
    log "Attempting to materialize the key via scripts/setup-hetzner-ssh.sh."
    "$(dirname "$0")/setup-hetzner-ssh.sh"
  else
    log "Cannot create the key file because the secret is unavailable."
  fi
fi

if [[ -f "${CONFIG_PATH}" ]] && grep -q "Host ${SSH_ALIAS}" "${CONFIG_PATH}"; then
  log "SSH alias '${SSH_ALIAS}' is defined in ${CONFIG_PATH}."
else
  log "SSH alias '${SSH_ALIAS}' is not present in ${CONFIG_PATH}."
fi

log "Probing direct TCP connectivity to ${HOST_IP}:${HOST_PORT}."
if TARGET_HOST="${HOST_IP}" TARGET_PORT="${HOST_PORT}" python3 <<'PY'
import os
import socket
import sys
host = os.environ['TARGET_HOST']
port = int(os.environ['TARGET_PORT'])
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(5)
try:
    sock.connect((host, port))
except OSError as exc:
    print(f"[hetzner-debug] Direct TCP probe failed: {exc}")
    sys.exit(1)
else:
    print("[hetzner-debug] Direct TCP probe succeeded.")
finally:
    sock.close()
PY
then
  direct_tcp_available=true
else
  direct_tcp_available=false
fi

proxy_url="${http_proxy:-${HTTP_PROXY:-}}"
if [[ -n "${proxy_url}" ]]; then
  log "Attempting HTTP CONNECT tunnel via ${proxy_url}."
  if TARGET_HOST="${HOST_IP}" TARGET_PORT="${HOST_PORT}" PROXY_URL="${proxy_url}" python3 <<'PY'
import os
import socket
import sys
from urllib.parse import urlparse
proxy = urlparse(os.environ['PROXY_URL'])
if not proxy.hostname:
    print("[hetzner-debug] Unable to parse proxy host from", os.environ['PROXY_URL'])
    sys.exit(1)
host = proxy.hostname
port = proxy.port or (443 if proxy.scheme == 'https' else 80)
target_host = os.environ['TARGET_HOST']
target_port = os.environ['TARGET_PORT']
request = f"CONNECT {target_host}:{target_port} HTTP/1.1\r\nHost: {target_host}:{target_port}\r\n\r\n"
try:
    sock = socket.create_connection((host, port), timeout=5)
    sock.sendall(request.encode())
    response = sock.recv(4096)
    first_line = response.splitlines()[0].decode(errors='ignore') if response else 'NO RESPONSE'
    print(f"[hetzner-debug] Proxy CONNECT response: {first_line}")
    if not first_line.endswith('200 Connection established') and '200' not in first_line:
        sys.exit(1)
except OSError as exc:
    print(f"[hetzner-debug] Proxy CONNECT failed: {exc}")
    sys.exit(1)
finally:
    try:
        sock.close()
    except Exception:
        pass
PY
  then
    proxy_tcp_available=true
  else
    proxy_tcp_available=false
  fi
else
  log "No HTTP proxy detected in environment; skipping CONNECT probe."
  proxy_tcp_available=false
fi

connection_attempted="false"
if [[ -f "${KEY_PATH}" ]]; then
  log "Attempting SSH handshake with ${HOST_USER}@${HOST_IP}:${HOST_PORT} (BatchMode)."
  connection_attempted="true"
  if ssh -i "${KEY_PATH}" -o BatchMode=yes -o ConnectTimeout=10 -p "${HOST_PORT}" "${HOST_USER}@${HOST_IP}" "echo 'Connection successful!'"; then
    log "SSH command succeeded."
  else
    log "SSH command failed with exit code $? (see output above)."
  fi
else
  log "Skipping SSH attempt because ${KEY_PATH} does not exist."
fi

if [[ "${secret_present}" != "true" ]]; then
  log "Secret missing. Provide HETZNER_VM_SSH_KEY and rerun the script."
fi

if [[ "${connection_attempted}" != "true" ]]; then
  exit 1
fi
