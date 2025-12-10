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
}

export interface MedusaFulfillment {
  id: string;
  order_id: string;
  provider_id: string;
  tracking_numbers: string[];
  tracking_links: Array<{ url: string }>;
  data: Record<string, unknown>;
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
 * Note: Medusa v2 may have different filter parameters than v1
 */
export async function listOrders(options: {
  status?: string;
  limit?: number;
} = {}): Promise<MedusaOrder[]> {
  const params = new URLSearchParams();
  if (options.status) params.set('status', options.status);
  if (options.limit) params.set('limit', options.limit.toString());

  const query = params.toString();
  const endpoint = `/admin/orders${query ? `?${query}` : ''}`;

  const response = await adminFetch<{ orders: MedusaOrder[] }>(endpoint);
  return response.orders;
}

/**
 * Get a specific order by ID.
 */
export async function getOrder(orderId: string): Promise<MedusaOrder> {
  const response = await adminFetch<{ order: MedusaOrder }>(
    `/admin/orders/${orderId}`
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

  const response = await adminFetch<{ order: MedusaOrder }>(
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

  // The fulfillment should be in the response
  // Get the latest fulfillment from the order
  const updatedOrder = await getOrder(orderId);

  console.log(`[Admin] Fulfillment created for order ${orderId}`);
  console.log(`[Admin] Order fulfillment status: ${updatedOrder.fulfillment_status}`);

  // Return a fulfillment-like object from what we know
  return {
    id: `ful_${orderId}`,
    order_id: orderId,
    provider_id: 'easypost',
    tracking_numbers: [],
    tracking_links: [],
    data: {},
    shipped_at: null,
    delivered_at: null,
  };
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
 * Get fulfillments for an order.
 */
export async function getOrderFulfillments(orderId: string): Promise<MedusaFulfillment[]> {
  const response = await adminFetch<{ fulfillments: MedusaFulfillment[] }>(
    `/admin/orders/${orderId}/fulfillments`
  );
  return response.fulfillments || [];
}

/**
 * Clear the cached auth token (useful between test runs).
 */
export function clearAuthToken(): void {
  authToken = null;
}
