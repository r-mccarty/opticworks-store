/**
 * E2E tests for inbound fulfillment webhook handling.
 *
 * Tests verify that EasyPost tracker events flow through Hookdeck
 * and are properly processed by the Medusa backend.
 *
 * Architecture:
 * ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
 * │   E2E Test      │     │   EasyPost      │     │   Hookdeck      │
 * │   (Playwright)  │────▶│   (Test Mode)   │────▶│   (Receives)    │
 * └─────────────────┘     └─────────────────┘     └────────┬────────┘
 *         │                                                 │
 *         │ Poll for event                                  │ Forward
 *         ▼                                                 ▼
 * ┌─────────────────┐                              ┌─────────────────┐
 * │   Hookdeck      │                              │   Medusa        │
 * │   API           │                              │   Backend       │
 * └─────────────────┘                              └─────────────────┘
 *
 * @see docs/reference/FULFILLMENT_INBOUND
 */

import { test, expect } from '@playwright/test';
import {
  isHookdeckConfigured,
  listEvents,
  waitForTrackerEvent,
  wasEventDelivered,
  getTrackerStatus,
  getTrackingCode,
} from '../fixtures/hookdeck-utils';
import { hookdeckConfig, easypostMagicCodes } from '../fixtures/test-data';

test.describe('Fulfillment Webhook Integration', () => {
  test.beforeAll(() => {
    if (!isHookdeckConfigured()) {
      console.warn(
        '[Test] HOOKDECK_API_KEY not configured - webhook verification tests will be skipped'
      );
    }
  });

  test('Hookdeck API is accessible', async () => {
    test.skip(!isHookdeckConfigured(), 'Hookdeck API key not configured');

    // Verify we can list events (empty result is fine)
    const events = await listEvents({ limit: 1 });
    expect(Array.isArray(events)).toBe(true);
    console.log(`[Test] Hookdeck API accessible, found ${events.length} recent events`);
  });

  test('can retrieve recent EasyPost tracker events', async () => {
    test.skip(!isHookdeckConfigured(), 'Hookdeck API key not configured');

    // Look for any recent tracker.updated events
    const events = await listEvents({ limit: 10 });
    const trackerEvents = events.filter((e) => {
      const body = e.data?.body as Record<string, unknown>;
      return body?.description === 'tracker.updated';
    });

    console.log(`[Test] Found ${trackerEvents.length} tracker events in recent history`);

    // Log details of any found events
    for (const event of trackerEvents.slice(0, 3)) {
      const status = getTrackerStatus(event);
      const code = getTrackingCode(event);
      const delivered = wasEventDelivered(event);
      console.log(
        `[Test] Event ${event.id}: tracking=${code}, status=${status}, delivered=${delivered}`
      );
    }
  });

  test('webhook endpoint responds to tracker.updated events', async ({ request }) => {
    // Test that the backend webhook endpoint exists and rejects unsigned requests
    const response = await request.post('https://api.optic.works/webhooks/easypost', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        description: 'tracker.updated',
        mode: 'test',
        result: {
          tracking_code: easypostMagicCodes.delivered,
          status: 'in_transit',
          shipment_id: 'shp_test',
          carrier: 'USPS',
          public_url: 'https://track.easypost.com/test',
        },
      },
    });

    // Should reject with 401 (invalid signature) - this confirms the endpoint exists
    // and is enforcing security
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe('Invalid signature');
    console.log('[Test] Webhook endpoint correctly rejects unsigned requests');
  });

  test.describe('Event Processing Verification', () => {
    /**
     * This test verifies the full flow when a real EasyPost tracker event
     * is received and processed. It requires:
     * 1. A fulfillment with a tracking code exists in Medusa
     * 2. EasyPost sends a tracker.updated event
     * 3. Hookdeck receives and forwards it
     * 4. Medusa processes it successfully
     *
     * In practice, this runs after a fulfillment is created with a magic tracking code.
     */
    test('tracker event is delivered successfully to backend', async () => {
      test.skip(!isHookdeckConfigured(), 'Hookdeck API key not configured');

      // Look for a recently delivered tracker event
      const events = await listEvents({ limit: 20 });
      const deliveredTrackerEvent = events.find((e) => {
        const body = e.data?.body as Record<string, unknown>;
        return body?.description === 'tracker.updated' && wasEventDelivered(e);
      });

      if (deliveredTrackerEvent) {
        const status = getTrackerStatus(deliveredTrackerEvent);
        const code = getTrackingCode(deliveredTrackerEvent);
        console.log(
          `[Test] Found delivered tracker event: tracking=${code}, status=${status}, response=${deliveredTrackerEvent.response_status}`
        );

        expect(deliveredTrackerEvent.response_status).toBeGreaterThanOrEqual(200);
        expect(deliveredTrackerEvent.response_status).toBeLessThan(300);
      } else {
        console.log('[Test] No delivered tracker events found in recent history');
        // This is not a failure - there may not be any recent events
        test.skip(true, 'No recent delivered tracker events to verify');
      }
    });
  });
});

test.describe('EasyPost Magic Code Testing', () => {
  /**
   * These tests document the expected behavior of EasyPost magic tracking codes.
   * They can be used to trigger test events when a fulfillment is created.
   */

  test('magic codes are defined for all statuses', () => {
    expect(easypostMagicCodes.delivered).toBe('EZ1000000001');
    expect(easypostMagicCodes.inTransit).toBe('EZ2000000002');
    expect(easypostMagicCodes.failure).toBe('EZ3000000003');
    expect(easypostMagicCodes.preTransit).toBe('EZ4000000004');
    expect(easypostMagicCodes.outForDelivery).toBe('EZ5000000005');

    console.log('[Test] EasyPost magic codes:');
    console.log('  - delivered:', easypostMagicCodes.delivered);
    console.log('  - inTransit:', easypostMagicCodes.inTransit);
    console.log('  - failure:', easypostMagicCodes.failure);
    console.log('  - preTransit:', easypostMagicCodes.preTransit);
    console.log('  - outForDelivery:', easypostMagicCodes.outForDelivery);
  });
});
