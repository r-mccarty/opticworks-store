# Backend Operations

SSH access, server logs, and Medusa Admin API operations.

---

## SSH Access

### Quick Connect

```bash
ssh hetzner-node
```

This alias is pre-configured in Codespaces. For local development, add to `~/.ssh/config`:

```
Host hetzner-node
    HostName <server-ip>
    User root
    IdentityFile ~/.ssh/id_ed25519
```

### Server Layout

```
/opt/opticworks/
├── medusa-backend/           # Medusa application
│   ├── .env                  # Environment variables
│   ├── logs/
│   │   ├── medusa-app.log    # Application logs (EasyPost, workflows, etc.)
│   │   ├── pm2-prod-out.log  # PM2 stdout
│   │   └── pm2-prod-error.log # PM2 stderr
│   └── node_modules/
└── backup/                   # Backup scripts
    ├── backup.sh
    └── restore.sh
```

---

## Viewing Logs

### Application Logs (Primary)

Medusa writes application logs to a file. This is where you'll find EasyPost operations, webhook processing, and workflow execution.

```bash
# View recent logs
ssh hetzner-node "tail -100 /opt/opticworks/medusa-backend/logs/medusa-app.log"

# Follow logs in real-time
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log"

# Search for specific patterns
ssh hetzner-node "grep -i easypost /opt/opticworks/medusa-backend/logs/medusa-app.log | tail -50"
ssh hetzner-node "grep -i webhook /opt/opticworks/medusa-backend/logs/medusa-app.log | tail -50"
ssh hetzner-node "grep -i error /opt/opticworks/medusa-backend/logs/medusa-app.log | tail -20"
```

### PM2 Logs (Process Wrapper)

PM2 logs show process start/stop events but NOT application-level logs (due to pnpm wrapper).

```bash
# View PM2 logs (limited utility)
ssh hetzner-node "pm2 logs medusa-prod --lines 50"

# Check PM2 status
ssh hetzner-node "pm2 status"

# Restart Medusa
ssh hetzner-node "pm2 restart medusa-prod"
```

### System Services

```bash
# Cloudflare Tunnel status
ssh hetzner-node "systemctl status cloudflared"

# PostgreSQL
ssh hetzner-node "systemctl status postgresql"

# Redis
ssh hetzner-node "redis-cli ping"
```

---

## Health Checks

```bash
# Backend API health
curl https://api.optic.works/health

# From server (localhost)
ssh hetzner-node "curl -s http://localhost:9000/health"

# PostgreSQL connectivity
ssh hetzner-node "sudo -u postgres psql -c 'SELECT version();'"

# Redis connectivity
ssh hetzner-node "redis-cli ping"
```

---

## Medusa Admin API

The Medusa Admin API allows programmatic management of orders, fulfillments, and other resources.

### Authentication

```bash
# Get auth token
curl -X POST https://api.optic.works/auth/user/emailpass \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@optic.works",
    "password": "<password>"
  }'

# Response: { "token": "eyJ..." }
export ADMIN_TOKEN="eyJ..."
```

### List Orders

```bash
# List recent orders
curl -s "https://api.optic.works/admin/orders?limit=20&fields=id,display_id,status,fulfillment_status,email" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.orders[] | {display_id, status, fulfillment_status, email}'

# Get specific order with fulfillments
curl -s "https://api.optic.works/admin/orders/{order_id}?fields=*,fulfillments.*" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.'
```

### Create Fulfillment

Creating a fulfillment triggers EasyPost to purchase a label and generate tracking.

```bash
# First, get order details
ORDER_ID="order_xxx"
curl -s "https://api.optic.works/admin/orders/$ORDER_ID?fields=*,items.*" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.order.items[] | {id, quantity}'

# Create fulfillment for all items
curl -X POST "https://api.optic.works/admin/orders/$ORDER_ID/fulfillments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "item_xxx", "quantity": 1}
    ],
    "no_notification": false
  }'
```

### Check Fulfillment Status

```bash
# Get fulfillment details
curl -s "https://api.optic.works/admin/fulfillments/{fulfillment_id}" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.fulfillment | {
    id,
    shipped_at,
    delivered_at,
    tracking_code: .data.tracking_code,
    carrier: .data.carrier,
    label_url: .data.label_url
  }'

# Get all fulfillments for an order
curl -s "https://api.optic.works/admin/orders/{order_id}/fulfillments" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.fulfillments'
```

### Common API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/admin/orders` | GET | List orders |
| `/admin/orders/{id}` | GET | Get order details |
| `/admin/orders/{id}/fulfillments` | POST | Create fulfillment |
| `/admin/orders/{id}/fulfillments` | GET | List order fulfillments |
| `/admin/fulfillments/{id}` | GET | Get fulfillment details |
| `/admin/products` | GET | List products |
| `/admin/customers` | GET | List customers |

### Query Parameters

```bash
# Pagination
?limit=20&offset=0

# Field selection (Medusa v2)
?fields=id,display_id,status,email,fulfillments.*

# Sorting
?order=created_at:desc
```

---

## Using the E2E Admin Utilities

The `e2e/fixtures/medusa-admin-utils.ts` file provides TypeScript utilities for admin operations. These can be used in scripts or tests.

### From Node.js/Scripts

```typescript
import {
  authenticateAdmin,
  listOrders,
  getOrder,
  createFulfillment,
  findFulfillableOrder,
} from './e2e/fixtures/medusa-admin-utils';

// Find and fulfill an order
const order = await findFulfillableOrder();
if (order) {
  const fulfillment = await createFulfillment(order.id);
  console.log(`Tracking: ${fulfillment.data.tracking_code}`);
}
```

### Environment Variables

Required for admin API access:

| Variable | Purpose |
|----------|---------|
| `MEDUSA_ADMIN_EMAIL` | Admin user email |
| `MEDUSA_ADMIN_PASSWORD` | Admin user password |
| `NEXT_PUBLIC_MEDUSA_BACKEND_URL` | API URL (default: https://api.optic.works) |

---

## Database Operations

### Direct PostgreSQL Access

```bash
# Connect to database
ssh hetzner-node "sudo -u postgres psql medusa_db"

# Common queries
ssh hetzner-node "sudo -u postgres psql medusa_db -c 'SELECT id, display_id, status FROM \"order\" ORDER BY created_at DESC LIMIT 10;'"

# Count orders by status
ssh hetzner-node "sudo -u postgres psql medusa_db -c 'SELECT status, COUNT(*) FROM \"order\" GROUP BY status;'"

# Check fulfillments
ssh hetzner-node "sudo -u postgres psql medusa_db -c 'SELECT id, shipped_at, data FROM fulfillment ORDER BY created_at DESC LIMIT 5;'"
```

### Backup & Restore

```bash
# Manual backup
ssh hetzner-node "/opt/opticworks/backup/backup.sh"

# List snapshots
ssh hetzner-node "/opt/opticworks/backup/restore.sh --list"

# Restore database only
ssh hetzner-node "/opt/opticworks/backup/restore.sh latest --db-only"
```

---

## Troubleshooting

### 502 Bad Gateway

```bash
# Check all services
ssh hetzner-node "systemctl status cloudflared && pm2 status && curl -s http://localhost:9000/health"

# Restart services
ssh hetzner-node "pm2 restart medusa-prod"
ssh hetzner-node "sudo systemctl restart cloudflared"
```

### Fulfillment Failed

1. Check Medusa logs for EasyPost errors:
   ```bash
   ssh hetzner-node "grep -i 'easypost\|fulfillment' /opt/opticworks/medusa-backend/logs/medusa-app.log | tail -30"
   ```

2. Verify EasyPost mode:
   ```bash
   ssh hetzner-node "grep EASYPOST /opt/opticworks/medusa-backend/.env"
   ```

3. Check if address is valid (EasyPost requires valid US addresses)

### Webhook Not Received

1. Check Hookdeck dashboard for delivery status
2. Verify Medusa is receiving requests:
   ```bash
   ssh hetzner-node "grep webhook /opt/opticworks/medusa-backend/logs/medusa-app.log | tail -20"
   ```

3. Check `HOOKDECK_WEBHOOK_SECRET` is set correctly

### Database Connection Issues

```bash
# Check PostgreSQL status
ssh hetzner-node "systemctl status postgresql"

# Check connection
ssh hetzner-node "sudo -u postgres psql -c 'SELECT 1;'"

# View PostgreSQL logs
ssh hetzner-node "tail -50 /var/log/postgresql/postgresql-17-main.log"
```

---

## Quick Reference

### One-Liners

```bash
# Application logs
ssh hetzner-node "tail -f /opt/opticworks/medusa-backend/logs/medusa-app.log"

# Service status
ssh hetzner-node "pm2 status && systemctl status cloudflared --no-pager"

# Recent orders
curl -s "https://api.optic.works/admin/orders?limit=5&fields=display_id,status,email" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.orders'

# Health check
curl -s https://api.optic.works/health

# Restart Medusa
ssh hetzner-node "pm2 restart medusa-prod"
```

---

## Related Docs

- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Ansible playbooks, provisioning
- [FULFILLMENT.md](FULFILLMENT.md) - EasyPost integration details
- [WEBHOOKS.md](WEBHOOKS.md) - Webhook handling
- [E2E_TESTING.md](E2E_TESTING.md) - Admin API utilities for testing
