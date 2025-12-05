# Cloudflare API Access

Programmatic access to Cloudflare resources for automation and infrastructure management.

---

## Authentication

### Environment Variables

These are configured in GitHub Codespaces secrets:

| Variable | Description |
|----------|-------------|
| `CLOUDFLARE_ACCOUNT_ID` | Account identifier (`39f8fd4a...`) |
| `CLOUDFLARE_EMAIL` | Account email |
| `CLOUDFLARE_GLOBAL_API_KEY` | Global API key (full access) |
| `CLOUDFLARE_API_TOKEN` | Scoped API token (limited access) |

### Using Global API Key

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json"
```

### Using API Token

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json"
```

---

## R2 Object Storage

### Create Bucket

```bash
curl -X POST "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"name": "my-bucket", "locationHint": "enam"}'
```

Location hints: `enam` (East North America), `wnam` (West North America), `weur` (Western Europe), `eeur` (Eastern Europe), `apac` (Asia Pacific)

### List Buckets

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

### Delete Bucket

```bash
curl -X DELETE "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/my-bucket" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

---

## R2 S3-Compatible Credentials

R2 uses S3-compatible API for object operations. Credentials are derived from API tokens.

### Create API Token for R2

```bash
# Get available permission groups
curl -X GET "https://api.cloudflare.com/client/v4/user/tokens/permission_groups" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" | jq '.result[] | select(.name | test("R2"))'

# Create token with R2 read/write permissions
curl -X POST "https://api.cloudflare.com/client/v4/user/tokens" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My R2 Token",
    "policies": [{
      "effect": "allow",
      "resources": {
        "com.cloudflare.api.account.'"${CLOUDFLARE_ACCOUNT_ID}"'": "*"
      },
      "permission_groups": [
        {"id": "6a018a9f2fc74eb6b293b0c548f38b39"},
        {"id": "2efd5506f9c8494dacb1fa10a3e7d5b6"}
      ]
    }]
  }'
```

### Convert Token to S3 Credentials

```bash
# From API response:
# - Access Key ID = token.id
# - Secret Access Key = SHA-256(token.value)

TOKEN_ID="abc123..."
TOKEN_VALUE="xyz789..."

ACCESS_KEY_ID="${TOKEN_ID}"
SECRET_ACCESS_KEY=$(echo -n "${TOKEN_VALUE}" | sha256sum | cut -d' ' -f1)

echo "AWS_ACCESS_KEY_ID=${ACCESS_KEY_ID}"
echo "AWS_SECRET_ACCESS_KEY=${SECRET_ACCESS_KEY}"
```

### S3 Endpoint

```
https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com
```

---

## R2 Permission Groups

| ID | Name |
|----|------|
| `6a018a9f2fc74eb6b293b0c548f38b39` | Workers R2 Storage Bucket Item Read |
| `2efd5506f9c8494dacb1fa10a3e7d5b6` | Workers R2 Storage Bucket Item Write |
| `b4992e1108244f5d8bfbd5744320c2e1` | Workers R2 Storage Read |
| `bf7481a1826f439697cb59a20b22293e` | Workers R2 Storage Write |

---

## Cloudflare Tunnels

### List Tunnels

```bash
curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

### Get Tunnel Token

```bash
TUNNEL_ID="db4738a9-..."

curl -X GET "https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/cfd_tunnel/${TUNNEL_ID}/token" \
  -H "X-Auth-Email: ${CLOUDFLARE_EMAIL}" \
  -H "X-Auth-Key: ${CLOUDFLARE_GLOBAL_API_KEY}"
```

---

## DNS Records

### List Records

```bash
ZONE_ID="..."  # Get from dashboard or zones API

curl -X GET "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}"
```

### Create Record

```bash
curl -X POST "https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records" \
  -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "CNAME",
    "name": "api",
    "content": "tunnel-id.cfargotunnel.com",
    "proxied": true
  }'
```

---

## Current Resources

| Resource | Name/ID |
|----------|---------|
| **Account ID** | `39f8fd4a5b0c7558aed585facd57ec3b` |
| **Public Bucket** | `opticworks-public` |
| **Backup Bucket** | `opticworks-backups` |
| **API Tunnel** | `db4738a9-20b7-4dd7-bde2-0760e0188071` |
| **R2 Endpoint** | `https://39f8fd4a5b0c7558aed585facd57ec3b.r2.cloudflarestorage.com` |

---

## References

- [Cloudflare API Docs](https://developers.cloudflare.com/api/)
- [R2 Authentication](https://developers.cloudflare.com/r2/api/tokens/)
- [R2 S3 Compatibility](https://developers.cloudflare.com/r2/api/s3/api/)
- [Tunnel API](https://developers.cloudflare.com/api/operations/cloudflare-tunnel-list-cloudflare-tunnels)
