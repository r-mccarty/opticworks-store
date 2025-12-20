# Device Management

Device registration, pairing, and management for OpticWorks RS-1 devices.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                     api.optic.works                                  │
│  ┌─────────────────────────┐    ┌──────────────────────────────┐   │
│  │   Medusa v2 Backend     │    │   Go Device Mgmt Service     │   │
│  │   - Device CRUD         │    │   - WebSocket signaling      │   │
│  │   - Customer pairing    │    │   - OTA updates              │   │
│  │   - Fulfillment         │    │   - Telemetry                │   │
│  └───────────┬─────────────┘    └──────────────┬───────────────┘   │
│              │                                  │                    │
│              └──────────────┬───────────────────┘                   │
│                    ┌────────┴────────┐                              │
│                    │   PostgreSQL    │                              │
│                    │   (shared DB)   │                              │
│                    └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────────┘
```

## Device Lifecycle

```
1. FULFILLMENT: Device created when order ships
   └── POST /admin/devices { serial_number, order_id }

2. REGISTRATION: Device boots and registers with cloud
   └── POST /devices/register { serial_number } → temp_token
   └── (Handled by Go Device Mgmt Service)

3. PAIRING: Customer pairs device to their account
   └── POST /store/devices/pair { serial_number }

4. OPERATION: Device connects via WebSocket
   └── WS /devices/{id}/signaling
   └── (Handled by Go Device Mgmt Service)

5. UNPAIRING: Customer removes device
   └── DELETE /store/devices/{id}
```

## API Endpoints

### Store API (Customer)

Requires customer authentication via bearer token.

#### List Customer's Devices

```http
GET /store/devices
Authorization: Bearer <customer_token>

Response:
{
  "devices": [
    {
      "id": "dev_123",
      "serial_number": "RS1-ABC123",
      "product_type": "rs1",
      "firmware_version": "1.0.0",
      "last_seen_at": "2024-01-15T10:30:00Z",
      "registered_at": "2024-01-10T08:00:00Z",
      "paired_at": "2024-01-10T08:05:00Z"
    }
  ]
}
```

#### Get Device Details

```http
GET /store/devices/:id
Authorization: Bearer <customer_token>

Response:
{
  "device": {
    "id": "dev_123",
    "serial_number": "RS1-ABC123",
    "product_type": "rs1",
    "firmware_version": "1.0.0",
    "last_seen_at": "2024-01-15T10:30:00Z",
    "registered_at": "2024-01-10T08:00:00Z",
    "paired_at": "2024-01-10T08:05:00Z",
    "metadata": { ... }
  }
}
```

#### Pair Device

```http
POST /store/devices/pair
Authorization: Bearer <customer_token>
Content-Type: application/json

{
  "serial_number": "RS1-ABC123"
}

Response:
{
  "device": {
    "id": "dev_123",
    "serial_number": "RS1-ABC123",
    "product_type": "rs1",
    "paired_at": "2024-01-10T08:05:00Z"
  },
  "message": "Device paired successfully"
}

Error Responses:
- 404: Device not found (serial not registered)
- 409: Device already paired to another account
```

#### Unpair Device

```http
DELETE /store/devices/:id
Authorization: Bearer <customer_token>

Response:
{
  "success": true
}
```

### Admin API

Requires admin authentication.

#### List All Devices

```http
GET /admin/devices?customer_id=&order_id=&product_type=&limit=50&offset=0

Response:
{
  "devices": [...],
  "count": 100,
  "limit": 50,
  "offset": 0
}
```

#### Create Device (Fulfillment)

```http
POST /admin/devices
Content-Type: application/json

{
  "serial_number": "RS1-ABC123",
  "product_type": "rs1",
  "order_id": "order_456",
  "metadata": {
    "batch": "2024-01",
    "factory": "shenzhen"
  }
}

Response:
{
  "device": {
    "id": "dev_123",
    "serial_number": "RS1-ABC123",
    ...
  }
}
```

#### Get Device

```http
GET /admin/devices/:id

Response:
{
  "device": { ... }
}
```

#### Update Device

```http
PATCH /admin/devices/:id
Content-Type: application/json

{
  "firmware_version": "1.1.0",
  "metadata": { "last_update": "2024-01-15" }
}

Response:
{
  "device": { ... }
}
```

#### Delete Device

```http
DELETE /admin/devices/:id

Response:
{
  "success": true
}
```

## Data Model

```typescript
Device {
  id: string                    // Medusa ID (e.g., "dev_123")
  serial_number: string         // Hardware serial (unique)
  product_type: string          // Product SKU (default: "rs1")
  firmware_version: string?     // Current firmware
  customer_id: string?          // Linked customer
  order_id: string?             // Order that included device
  cloud_token: string?          // Bearer token for device auth
  temp_token: string?           // Temporary registration token
  last_seen_at: Date?           // Last cloud connection
  registered_at: Date?          // First cloud registration
  paired_at: Date?              // When paired to customer
  metadata: JSON?               // Extensible metadata
  created_at: Date
  updated_at: Date
}
```

## Authentication Flow

### Device Registration (Go Service)

```
1. Device boots, reads serial from /proc/cpuinfo
2. Device calls POST /devices/register { serial_number }
3. If serial exists (pre-registered), return { temp_token, device_id }
4. If serial not found, return 404 (device not sold)
```

### Customer Pairing (Medusa)

```
1. Customer logs into app
2. Customer enters serial number or scans QR code
3. App calls POST /store/devices/pair { serial_number }
4. Medusa updates device.customer_id and generates cloud_token
5. Device polls or receives push notification
6. Device exchanges temp_token for cloud_token
```

### Device Cloud Connection (Go Service)

```
1. Device connects to WebSocket with cloud_token
2. Go service validates token against device table
3. If valid, device is authenticated and can receive commands
```

## Fulfillment Integration

When an order ships, the fulfillment workflow should create device records:

```typescript
// In order-shipped subscriber or fulfillment workflow

const deviceService = container.resolve("device")

// For each device in the shipment
for (const serial of deviceSerials) {
  await deviceService.createDevice({
    serial_number: serial,
    product_type: "rs1",
    order_id: order.id,
    metadata: {
      shipped_at: new Date().toISOString(),
      tracking_number: fulfillment.tracking_number,
    },
  })
}
```

## Go Device Management Service

The Go service handles real-time device communication. See `hardwareos/docs/CLOUD_API.md` for specification.

### Endpoints (Go Service)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/devices/register` | Serial | Device registration |
| POST | `/devices/token` | Temp token | Token exchange |
| DELETE | `/devices/:id` | Bearer | Deregister |
| GET | `/devices/:id/ota` | Bearer | Check updates |
| POST | `/devices/:id/telemetry` | Bearer | Submit metrics |
| WS | `/devices/:id/signaling` | Bearer | WebRTC signaling |

### Database Access

The Go service reads from the same PostgreSQL database as Medusa:

- Reads: `device` table (created by Medusa migrations)
- Writes: `device.last_seen_at`, `device.firmware_version`
- Creates: `device_telemetry`, `device_ota_updates` (Go migrations)

## Module Files

```
backend/src/modules/device/
├── index.ts              # Module definition
├── service.ts            # DeviceModuleService
├── types.ts              # TypeScript types
└── models/
    └── device.ts         # Data model

backend/src/api/store/devices/
├── route.ts              # GET /store/devices
├── pair/route.ts         # POST /store/devices/pair
└── [id]/route.ts         # GET, DELETE /store/devices/:id

backend/src/api/admin/devices/
├── route.ts              # GET, POST /admin/devices
└── [id]/route.ts         # GET, PATCH, DELETE /admin/devices/:id

backend/src/links/
└── device-customer.ts    # Device-Customer relationship
```

## Database Schema

### Device Table

```sql
CREATE TABLE device (
    id VARCHAR(255) PRIMARY KEY,
    serial_number VARCHAR(255) NOT NULL UNIQUE,
    product_type VARCHAR(255) DEFAULT 'rs1',
    firmware_version VARCHAR(255),
    customer_id VARCHAR(255),
    order_id VARCHAR(255),
    cloud_token VARCHAR(255),
    temp_token VARCHAR(255),
    last_seen_at TIMESTAMP WITH TIME ZONE,
    registered_at TIMESTAMP WITH TIME ZONE,
    paired_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE UNIQUE INDEX idx_device_serial_number ON device(serial_number);
CREATE INDEX idx_device_customer_id ON device(customer_id);
CREATE INDEX idx_device_order_id ON device(order_id);
CREATE INDEX idx_device_cloud_token ON device(cloud_token);
CREATE INDEX idx_device_temp_token ON device(temp_token);
```

### Device-Customer Link Table

```sql
-- Automatically created by Medusa link definition
CREATE TABLE customer_customer_device_device (
    id VARCHAR(255) PRIMARY KEY,
    customer_id VARCHAR(255) NOT NULL REFERENCES customer(id),
    device_id VARCHAR(255) NOT NULL REFERENCES device(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_link_customer_id ON customer_customer_device_device(customer_id);
CREATE INDEX idx_link_device_id ON customer_customer_device_device(device_id);
```

### Go Service Tables (Future)

The Go device management service will create additional tables:

```sql
-- Telemetry data from devices
CREATE TABLE device_telemetry (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL REFERENCES device(id),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    metrics JSONB NOT NULL,
    events JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_device_telemetry_device_id ON device_telemetry(device_id);
CREATE INDEX idx_device_telemetry_timestamp ON device_telemetry(timestamp);

-- OTA update tracking
CREATE TABLE device_ota_updates (
    id SERIAL PRIMARY KEY,
    device_id VARCHAR(255) NOT NULL REFERENCES device(id),
    from_version VARCHAR(255) NOT NULL,
    to_version VARCHAR(255) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending',  -- pending, downloading, applying, completed, failed
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_device_ota_device_id ON device_ota_updates(device_id);
```

## Migrations

After adding the device module, run:

```bash
cd backend
pnpm medusa db:generate device
pnpm medusa db:migrate
```

The migration will:
1. Create the `device` table with all columns
2. Create the `customer_customer_device_device` link table
3. Set up foreign key relationships
