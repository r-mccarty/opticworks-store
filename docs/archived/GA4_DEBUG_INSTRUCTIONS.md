# GA4 Debug Instructions for OpticWorks

## Current GA4 Setup Status ✅

Your Google Analytics 4 implementation is now enhanced with debug capabilities:

- **Measurement ID**: `G-ZVKN68R4Y7` 
- **Stream**: OpticWorks (https://optic.works)
- **Debug Mode**: Automatically enabled in development environment
- **Enhanced Logging**: Console logs for troubleshooting

## Immediate Action Steps

### 1. Check Browser Console
Open your browser's developer tools (F12) and navigate to the Console tab. You should see:
```
GA4: Initialized with measurement ID G-ZVKN68R4Y7
GA4: Environment: Development
GA4: Debug mode: Enabled
GA4: Visit DebugView at https://analytics.google.com/analytics/web/#/p12118393170/reports/explorer?params=_u..debug-view
GA4: Current domain: localhost
GA4: Page view tracked for / (DEBUG MODE)
```

### 2. Access GA4 DebugView
1. Go to [GA4 DebugView](https://analytics.google.com/analytics/web/#/p12118393170/reports/explorer?params=_u..debug-view)
2. You should see real-time events from your localhost testing
3. Look for the `ga4_initialization` event that fires automatically

### 3. Test Page Tracking
- Navigate between pages on localhost:3000
- Each page change should log: `GA4: Page view tracked for [URL] (DEBUG MODE)`
- Events should appear in DebugView within seconds

### 4. Why Data Collection Might Appear Inactive

**Common Causes:**
1. **Browser Extensions**: Ad blockers/privacy tools blocking GA4
2. **Domain Mismatch**: Testing on localhost vs production optic.works 
3. **Data Processing Delay**: Standard reports take 24-48 hours
4. **Consent/Cookies**: Browser settings blocking analytics cookies

**Solutions:**
1. **Disable ad blockers** while testing
2. **Use Real-Time reports** instead of waiting for standard reports
3. **Check DebugView** for immediate validation
4. **Test in incognito mode** to avoid extension interference

### 5. Production Deployment

When you deploy to https://optic.works:
1. Debug mode will automatically disable
2. Data collection should begin immediately
3. Real-time reports will show activity within minutes
4. Standard reports populate within 24-48 hours

## Troubleshooting Commands

```bash
# Check current environment
echo $NODE_ENV

# Test with debug parameter (optional - auto-enabled in dev)
open "http://localhost:3000?debug_mode=true"

# Verify environment variable
grep GA_MEASUREMENT_ID .env
```

## Next Steps

1. **Test locally**: Verify debug logs and DebugView show events
2. **Deploy to production**: Push changes to optic.works domain
3. **Monitor Real-Time**: Check GA4 Real-Time reports after deployment
4. **Wait for data**: Allow 24-48 hours for full reporting data

Your GA4 setup is technically correct - the "data collection not active" warning is likely due to domain mismatch or browser blocking during local development.