# Hookdeck Transformations

Custom transformations for Hookdeck webhook processing.

## EasyPost Verify

Custom HMAC signature verification for EasyPost webhooks.

### Background

EasyPost sends webhook signatures with a `hmac-sha256-hex=` prefix that Hookdeck's native HMAC verification cannot parse. This transformation implements custom verification at the Hookdeck layer.

See [RFD-012](../../docs/reference/RFD-012-easypost-hookdeck-verification.md) for full architecture details.

### Build

```bash
cd infrastructure/hookdeck-transformations/easypost-verify
npm install
npm run build
```

The bundled output will be in `dist/index.js`.

### Deploy to Hookdeck

1. **Disable Source Verification**
   - Go to Hookdeck Dashboard → Sources → `easypost`
   - Set Verification to "None" (the transformation handles verification)

2. **Create Transformation**
   - Go to Hookdeck Dashboard → Transformations
   - Create new transformation named `easypost-verify`
   - Paste the contents of `dist/index.js`

3. **Set Environment Variables**
   - In the transformation settings, add:
     - `EASYPOST_WEBHOOK_SECRET`: Your EasyPost webhook signing secret

4. **Attach to Connection**
   - Go to Connections → EasyPost → OpticWorks-EasyPost-Gateway
   - Add the `easypost-verify` transformation

### How It Works

```
EasyPost ──[X-Hmac-Signature]──> Hookdeck (Verification: None)
                                     │
                                     ▼
                              Transformation
                              (verify-easypost handler)
                                     │
                            ┌────────┴────────┐
                            │                 │
                      Valid Signature    Invalid Signature
                            │                 │
                            ▼                 ▼
                    Deliver to Backend   Mark Failed
```

The transformation:
1. Extracts `X-Hmac-Signature` header
2. Strips `hmac-sha256-hex=` prefix
3. Computes HMAC-SHA256 over the request body
4. Compares signatures
5. If valid, adds `x-hookdeck-verified-worker: true` header
6. If invalid, throws error (event marked as Failed, not delivered)

### Testing

1. Build and deploy the transformation
2. Create an EasyPost test tracker with a magic code:
   - `EZ1000000001` - Auto-transitions to delivered
   - `EZ2000000002` - Auto-transitions to in_transit
3. Check Hookdeck logs:
   - Request should be accepted (not rejected at ingestion)
   - Transformation should execute successfully
   - Event should be delivered to backend with 200 response

### Troubleshooting

**Signature Mismatch**
- Verify `EASYPOST_WEBHOOK_SECRET` matches your EasyPost dashboard
- Check if EasyPost sends minified or pretty-printed JSON
- The transformation uses `JSON.stringify(request.body)` which produces minified output

**Transformation Not Running**
- Ensure transformation is attached to the connection
- Check transformation is enabled
- Verify source verification is set to "None"

### Local Development

The transformation can't be run locally as it depends on Hookdeck's `addHandler` global. For local testing:

1. Use the Medusa backend's dev bypass: `x-dev-bypass: true` header
2. Or temporarily disable Hookdeck verification and test directly
