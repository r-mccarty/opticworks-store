/**
 * Hookdeck API utilities for E2E testing.
 * Allows E2E tests to verify that webhook events were received and delivered.
 *
 * @see https://hookdeck.com/docs/api
 */

import { hookdeckConfig } from './test-data';

export interface HookdeckEvent {
  id: string;
  team_id: string;
  webhook_id: string;
  source_id: string;
  destination_id: string;
  attempts: number;
  response_status: number | null;
  last_attempt_at: string | null;
  created_at: string;
  data: {
    body: Record<string, unknown>;
    headers: Record<string, string>;
  };
}

export interface HookdeckEventListResponse {
  models: HookdeckEvent[];
  pagination: {
    order_by: string;
    dir: string;
    limit: number;
    next: string | null;
    prev: string | null;
  };
}

export interface HookdeckDeliveryAttempt {
  id: string;
  event_id: string;
  response_status: number;
  successful_at: string | null;
  created_at: string;
  body: string;
}

/**
 * Check if Hookdeck API is configured.
 */
export function isHookdeckConfigured(): boolean {
  return Boolean(hookdeckConfig.apiKey);
}

/**
 * Make an authenticated request to the Hookdeck API.
 */
async function hookdeckFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${hookdeckConfig.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${hookdeckConfig.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Hookdeck API error: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * List recent events from Hookdeck.
 *
 * @param options - Filter options
 * @returns List of events
 */
export async function listEvents(options: {
  sourceId?: string;
  destinationId?: string;
  limit?: number;
  createdAtGte?: string;
} = {}): Promise<HookdeckEvent[]> {
  if (!isHookdeckConfigured()) {
    console.warn('[Hookdeck] API key not configured, skipping event lookup');
    return [];
  }

  const params = new URLSearchParams();
  if (options.sourceId) params.set('source_id', options.sourceId);
  if (options.destinationId) params.set('destination_id', options.destinationId);
  if (options.limit) params.set('limit', options.limit.toString());
  if (options.createdAtGte) params.set('created_at[gte]', options.createdAtGte);

  const query = params.toString();
  const endpoint = `/events${query ? `?${query}` : ''}`;

  const response = await hookdeckFetch<HookdeckEventListResponse>(endpoint);
  return response.models;
}

/**
 * Get a specific event by ID.
 *
 * @param eventId - The event ID
 * @returns The event details
 */
export async function getEvent(eventId: string): Promise<HookdeckEvent | null> {
  if (!isHookdeckConfigured()) {
    console.warn('[Hookdeck] API key not configured, skipping event lookup');
    return null;
  }

  try {
    return await hookdeckFetch<HookdeckEvent>(`/events/${eventId}`);
  } catch (error) {
    console.error(`[Hookdeck] Failed to get event ${eventId}:`, error);
    return null;
  }
}

/**
 * Wait for an event matching the specified criteria.
 * Polls the Hookdeck API until an event is found or timeout is reached.
 *
 * @param matcher - Function to match events
 * @param options - Polling options
 * @returns The matching event, or null if not found
 */
export async function waitForEvent(
  matcher: (event: HookdeckEvent) => boolean,
  options: {
    timeout?: number;
    pollInterval?: number;
    sourceId?: string;
    destinationId?: string;
  } = {}
): Promise<HookdeckEvent | null> {
  if (!isHookdeckConfigured()) {
    console.log('[Hookdeck] Skipping event verification - not configured');
    return null;
  }

  const { timeout = 60000, pollInterval = 2000, sourceId, destinationId } = options;
  const startTime = Date.now();
  const createdAtGte = new Date(startTime - 5000).toISOString(); // Look back 5 seconds

  console.log(`[Hookdeck] Waiting for matching event (timeout: ${timeout}ms)...`);

  while (Date.now() - startTime < timeout) {
    const events = await listEvents({
      sourceId,
      destinationId,
      limit: 20,
      createdAtGte,
    });

    const matchingEvent = events.find(matcher);
    if (matchingEvent) {
      console.log(`[Hookdeck] Found matching event: ${matchingEvent.id}`);
      return matchingEvent;
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval));
  }

  console.warn('[Hookdeck] Timeout waiting for matching event');
  return null;
}

/**
 * Wait for an EasyPost tracker event with a specific tracking code and status.
 *
 * @param trackingCode - The tracking code to look for
 * @param status - The expected status (e.g., 'in_transit', 'delivered')
 * @param options - Polling options
 * @returns The matching event, or null if not found
 */
export async function waitForTrackerEvent(
  trackingCode: string,
  status?: string,
  options: {
    timeout?: number;
    pollInterval?: number;
  } = {}
): Promise<HookdeckEvent | null> {
  console.log(`[Hookdeck] Waiting for tracker event: tracking=${trackingCode}${status ? `, status=${status}` : ''}`);

  return waitForEvent(
    (event) => {
      const body = event.data?.body as Record<string, unknown>;
      if (body?.description !== 'tracker.updated') return false;

      const result = body?.result as Record<string, unknown>;
      if (result?.tracking_code !== trackingCode) return false;

      if (status && result?.status !== status) return false;

      return true;
    },
    options
  );
}

/**
 * Check if an event was successfully delivered (2xx response).
 *
 * @param event - The event to check
 * @returns true if the event was delivered successfully
 */
export function wasEventDelivered(event: HookdeckEvent): boolean {
  const status = event.response_status;
  return status !== null && status >= 200 && status < 300;
}

/**
 * Extract the tracking status from an EasyPost tracker event.
 *
 * @param event - The Hookdeck event containing an EasyPost payload
 * @returns The tracking status, or undefined if not found
 */
export function getTrackerStatus(event: HookdeckEvent): string | undefined {
  const body = event.data?.body as Record<string, unknown>;
  const result = body?.result as Record<string, unknown>;
  return result?.status as string | undefined;
}

/**
 * Extract the tracking code from an EasyPost tracker event.
 *
 * @param event - The Hookdeck event containing an EasyPost payload
 * @returns The tracking code, or undefined if not found
 */
export function getTrackingCode(event: HookdeckEvent): string | undefined {
  const body = event.data?.body as Record<string, unknown>;
  const result = body?.result as Record<string, unknown>;
  return result?.tracking_code as string | undefined;
}
