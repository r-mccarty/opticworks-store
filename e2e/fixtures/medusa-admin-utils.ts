/**
 * Medusa Admin API utilities for E2E testing.
 * Allows E2E tests to interact with the Medusa backend as an admin user.
 *
 * @see https://docs.medusajs.com/api/admin
 */

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'https://api.optic.works';

export interface AdminAuthConfig {
  email: string;
  password: string;
}

export interface MedusaOrder {
  id: string;
  display_id: number;
  status: string;
  fulfillment_status: string;
  email: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    variant_id: string;
  }>;
  shipping_address: Record<string, unknown>;
  shipping_methods: Array<{
    id: string;
    shipping_option_id: string;
    data: Record<string, unknown>;
  }>;
  fulfillments?: MedusaFulfillment[];
}

export interface EasyPostFulfillmentData {
  easypost_shipment_id?: string;
  tracking_code?: string;
  tracking_url?: string;
  label_url?: string;
  label_format?: string;
  carrier?: string;
  service?: string;
  delivery_status?: string;
  delivered_at?: string;
}

export interface MedusaFulfillment {
  id: string;
  order_id?: string;
  provider_id?: string;
  tracking_numbers?: string[];
  tracking_links?: Array<{ url: string }>;
  labels?: Array<{ tracking_number: string; tracking_url?: string; label_url?: string }>;
  data: EasyPostFulfillmentData | Record<string, unknown>;
  shipped_at: string | null;
  delivered_at: string | null;
}

let authToken: string | null = null;

/**
 * Get admin credentials from environment.
 */
export function getAdminCredentials(): AdminAuthConfig {
  const email = process.env.MEDUSA_ADMIN_EMAIL;
  const password = process.env.MEDUSA_ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'MEDUSA_ADMIN_EMAIL and MEDUSA_ADMIN_PASSWORD must be set for admin API tests'
    );
  }

  return { email, password };
}

/**
 * Check if admin credentials are configured.
 */
export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.MEDUSA_ADMIN_EMAIL && process.env.MEDUSA_ADMIN_PASSWORD
  );
}

/**
 * Authenticate with the Medusa Admin API and get a session token.
 */
export async function authenticateAdmin(): Promise<string> {
  if (authToken) {
    return authToken;
  }

  const credentials = getAdminCredentials();
  console.log(`[Admin] Authenticating as ${credentials.email}...`);

  const response = await fetch(`${MEDUSA_BACKEND_URL}/auth/user/emailpass`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Admin authentication failed: ${response.status} ${error}`);
  }

  const data = await response.json();
  authToken = data.token;

  if (!authToken) {
    throw new Error('No token returned from authentication');
  }

  console.log('[Admin] Authentication successful');
  return authToken;
}

/**
 * Make an authenticated request to the Medusa Admin API.
 */
async function adminFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await authenticateAdmin();

  const response = await fetch(`${MEDUSA_BACKEND_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Admin API error: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * List orders from the Admin API.
 * Note: Medusa v2 Admin API has limited filter options, so we fetch more and filter in-memory
 */
export async function listOrders(options: {
  status?: string;
  limit?: number;
} = {}): Promise<MedusaOrder[]> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.limit) params.set('limit', options.limit.toString());
  // Medusa v2 requires explicit field selection - include email, essential fields, and fulfillments
  params.set('fields', 'id,display_id,status,fulfillment_status,email,items,shipping_address,shipping_methods,fulfillments.*');

  const query = params.toString();
  const endpoint = `/admin/orders${query ? `?${query}` : ''}`;

  const response = await adminFetch<{ orders: MedusaOrder[] }>(endpoint);
  return response.orders;
}

/**
 * Find an order by email address with polling.
 * Note: Medusa v2 doesn't support email filter, so we fetch recent orders and filter in-memory.
 * Includes retry logic since order creation may be async.
 */
export async function findOrderByEmail(
  email: string,
  options: { timeout?: number; pollInterval?: number } = {}
): Promise<MedusaOrder | null> {
  const { timeout = 30000, pollInterval = 2000 } = options;
  const startTime = Date.now();

  console.log(`[Admin] Finding order by email: ${email} (timeout: ${timeout}ms)...`);

  while (Date.now() - startTime < timeout) {
    // Fetch recent orders and filter by email
    const orders = await listOrders({ limit: 50 });
    console.log(`[Admin] Fetched ${orders.length} orders, searching for email match...`);

    const order = orders.find((o) => o.email === email);

    if (order) {
      console.log(`[Admin] Found order ${order.display_id} (${order.id})`);
      return order;
    }

    // Log some emails for debugging
    if (orders.length > 0) {
      const sampleEmails = orders.slice(0, 3).map((o) => o.email);
      console.log(`[Admin] Sample emails: ${sampleEmails.join(', ')}`);
    }

    console.log(`[Admin] Order not found yet, retrying in ${pollInterval}ms...`);
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  console.log('[Admin] Timeout: No order found for email');
  return null;
}

/**
 * Get a specific order by ID.
 */
export async function getOrder(orderId: string): Promise<MedusaOrder> {
  // Request fulfillments with all their fields including data
  const response = await adminFetch<{ order: MedusaOrder }>(
    `/admin/orders/${orderId}?fields=*,fulfillments.*`
  );
  return response.order;
}

/**
 * Create a fulfillment for an order.
 * This will trigger EasyPost to create a shipment and generate tracking info.
 */
export async function createFulfillment(
  orderId: string,
  options: {
    items?: Array<{ id: string; quantity: number }>;
    location_id?: string;
    no_notification?: boolean;
  } = {}
): Promise<MedusaFulfillment> {
  console.log(`[Admin] Creating fulfillment for order ${orderId}...`);

  // First, get the order to find items and shipping method
  const order = await getOrder(orderId);

  // Default to all items if not specified
  const items = options.items || order.items.map((item) => ({
    id: item.id,
    quantity: item.quantity,
  }));

  await adminFetch<{ order: MedusaOrder }>(
    `/admin/orders/${orderId}/fulfillments`,
    {
      method: 'POST',
      body: JSON.stringify({
        items,
        location_id: options.location_id,
        no_notification: options.no_notification ?? true,
      }),
    }
  );

  // Fetch the updated order with fulfillments to get the actual fulfillment data
  const updatedOrder = await getOrder(orderId);

  console.log(`[Admin] Fulfillment created for order ${orderId}`);
  console.log(`[Admin] Order fulfillment status: ${updatedOrder.fulfillment_status}`);

  // Extract the latest fulfillment from the order
  const fulfillments = updatedOrder.fulfillments || [];
  if (fulfillments.length === 0) {
    console.warn(`[Admin] No fulfillments found on order after creation - fetching directly`);
    // Try to get fulfillments through a separate endpoint
    const orderFulfillments = await getOrderFulfillments(orderId);
    if (orderFulfillments.length > 0) {
      const latestFulfillment = orderFulfillments[orderFulfillments.length - 1];
      const data = latestFulfillment.data as EasyPostFulfillmentData;
      console.log(`[Admin] Fulfillment ${latestFulfillment.id}: tracking_code=${data.tracking_code || 'N/A'}`);
      return latestFulfillment;
    }
    throw new Error('Fulfillment was created but could not be retrieved');
  }

  // Get the most recent fulfillment (last in the array)
  const latestFulfillment = fulfillments[fulfillments.length - 1];
  const data = latestFulfillment.data as EasyPostFulfillmentData;

  console.log(`[Admin] Fulfillment ${latestFulfillment.id}:`);
  console.log(`[Admin]   tracking_code: ${data.tracking_code || 'N/A'}`);
  console.log(`[Admin]   easypost_shipment_id: ${data.easypost_shipment_id || 'N/A'}`);
  console.log(`[Admin]   carrier: ${data.carrier || 'N/A'}`);

  return latestFulfillment;
}

/**
 * Find an order that can be fulfilled (has items but not yet fulfilled).
 */
export async function findFulfillableOrder(): Promise<MedusaOrder | null> {
  console.log('[Admin] Looking for unfulfilled orders...');

  const orders = await listOrders({ limit: 20 });

  // Filter in-memory for unfulfilled orders
  const unfulfilled = orders.filter(
    (order) => order.fulfillment_status === 'not_fulfilled'
  );

  if (unfulfilled.length === 0) {
    console.log('[Admin] No unfulfilled orders found');
    return null;
  }

  console.log(`[Admin] Found ${unfulfilled.length} unfulfilled orders`);
  return unfulfilled[0];
}

/**
 * Try to create a fulfillment for any available order.
 * Returns the first order + fulfillment that succeeds, or null if none work.
 */
export async function tryCreateFulfillmentForAnyOrder(): Promise<{
  order: MedusaOrder;
  fulfillment: MedusaFulfillment;
} | null> {
  console.log('[Admin] Trying to create fulfillment for any available order...');

  const orders = await listOrders({ limit: 20 });

  // Filter for unfulfilled orders
  const unfulfilled = orders.filter(
    (order) => order.fulfillment_status === 'not_fulfilled'
  );

  if (unfulfilled.length === 0) {
    console.log('[Admin] No unfulfilled orders found');
    return null;
  }

  console.log(`[Admin] Found ${unfulfilled.length} unfulfilled orders, trying each...`);

  // Try each order until one succeeds
  for (const order of unfulfilled) {
    try {
      console.log(`[Admin] Trying order ${order.display_id} (${order.id})...`);
      const fulfillment = await createFulfillment(order.id, {
        no_notification: true,
      });
      console.log(`[Admin] Successfully created fulfillment for order ${order.display_id}`);
      return { order, fulfillment };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.log(`[Admin] Order ${order.display_id} failed: ${errorMsg.slice(0, 100)}`);
      // Continue to next order
    }
  }

  console.log('[Admin] None of the unfulfilled orders could be fulfilled');
  return null;
}

/**
 * Get fulfillments for an order.
 */
export async function getOrderFulfillments(orderId: string): Promise<MedusaFulfillment[]> {
  const response = await adminFetch<{ fulfillments: MedusaFulfillment[] }>(
    `/admin/orders/${orderId}/fulfillments`
  );
  return response.fulfillments || [];
}

/**
 * Get a specific fulfillment by ID.
 */
export async function getFulfillment(fulfillmentId: string): Promise<MedusaFulfillment> {
  console.log(`[Admin] Fetching fulfillment ${fulfillmentId}...`);
  const response = await adminFetch<{ fulfillment: MedusaFulfillment }>(
    `/admin/fulfillments/${fulfillmentId}`
  );
  return response.fulfillment;
}

/**
 * Verify fulfillment status after webhook processing.
 * Polls the fulfillment until expected state is reached or timeout.
 */
export async function verifyFulfillmentStatus(
  fulfillmentId: string,
  expected: {
    shipped?: boolean;
    delivered?: boolean;
  },
  options: { timeout?: number; pollInterval?: number } = {}
): Promise<{ success: boolean; fulfillment: MedusaFulfillment | null; message: string }> {
  const { timeout = 30000, pollInterval = 3000 } = options;
  const startTime = Date.now();

  console.log(`[Admin] Verifying fulfillment ${fulfillmentId} status...`);
  console.log(`[Admin] Expected: shipped=${expected.shipped}, delivered=${expected.delivered}`);

  while (Date.now() - startTime < timeout) {
    try {
      const fulfillment = await getFulfillment(fulfillmentId);
      const data = fulfillment.data as EasyPostFulfillmentData;

      const isShipped = fulfillment.shipped_at !== null;
      const isDelivered = fulfillment.delivered_at !== null || data.delivery_status === 'delivered';

      console.log(`[Admin] Current state: shipped_at=${fulfillment.shipped_at}, delivered_at=${fulfillment.delivered_at}`);

      // Check if we meet all expected conditions
      let allConditionsMet = true;

      if (expected.shipped !== undefined && isShipped !== expected.shipped) {
        allConditionsMet = false;
      }

      if (expected.delivered !== undefined && isDelivered !== expected.delivered) {
        allConditionsMet = false;
      }

      if (allConditionsMet) {
        console.log(`[Admin] Fulfillment status verified successfully`);
        return {
          success: true,
          fulfillment,
          message: `Fulfillment ${fulfillmentId} matches expected state`,
        };
      }

      console.log(`[Admin] Status not yet reached, waiting ${pollInterval}ms...`);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    } catch (error) {
      console.error(`[Admin] Error fetching fulfillment: ${error}`);
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }
  }

  // Final check after timeout
  try {
    const fulfillment = await getFulfillment(fulfillmentId);
    return {
      success: false,
      fulfillment,
      message: `Timeout: fulfillment did not reach expected state within ${timeout}ms`,
    };
  } catch {
    return {
      success: false,
      fulfillment: null,
      message: `Timeout and failed to fetch final state`,
    };
  }
}

/**
 * Get the tracking code from a fulfillment.
 * Checks both the data.tracking_code and labels array.
 */
export function getTrackingCodeFromFulfillment(fulfillment: MedusaFulfillment): string | null {
  // First check data.tracking_code (EasyPost stores it here)
  const data = fulfillment.data as EasyPostFulfillmentData;
  if (data.tracking_code) {
    return data.tracking_code;
  }

  // Fallback to labels array
  if (fulfillment.labels && fulfillment.labels.length > 0) {
    return fulfillment.labels[0].tracking_number;
  }

  // Fallback to tracking_numbers array
  if (fulfillment.tracking_numbers && fulfillment.tracking_numbers.length > 0) {
    return fulfillment.tracking_numbers[0];
  }

  return null;
}

/**
 * Clear the cached auth token (useful between test runs).
 */
export function clearAuthToken(): void {
  authToken = null;
}
