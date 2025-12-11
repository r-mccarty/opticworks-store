import { Page, Request, Response } from '@playwright/test';

export interface NetworkEntry {
  url: string;
  method: string;
  status?: number;
  statusText?: string;
  requestBody?: string;
  responseBody?: string;
  error?: string;
  timestamp: Date;
  duration?: number;
}

export interface NetworkLogs {
  all: NetworkEntry[];
  apiCalls: NetworkEntry[];
  failures: NetworkEntry[];
  taxData: TaxApiData[];
}

/**
 * Tax-related data extracted from API responses.
 */
export interface TaxApiData {
  timestamp: Date;
  cartId?: string;
  taxTotal?: number;
  total?: number;
  subtotal?: number;
  shippingTotal?: number;
  source: 'cart' | 'order';
}

/**
 * Create a network logger for a page.
 * Captures all API requests to Medusa backend for debugging.
 */
export function createNetworkLogger(page: Page): NetworkLogs {
  const logs: NetworkLogs = {
    all: [],
    apiCalls: [],
    failures: [],
    taxData: [],
  };

  const pendingRequests = new Map<string, { entry: NetworkEntry; startTime: number }>();

  page.on('request', (request: Request) => {
    const url = request.url();
    const entry: NetworkEntry = {
      url,
      method: request.method(),
      requestBody: request.postData() ?? undefined,
      timestamp: new Date(),
    };

    logs.all.push(entry);

    // Track API calls to Medusa
    if (url.includes('api.optic.works') || url.includes('/store/')) {
      logs.apiCalls.push(entry);
      pendingRequests.set(url + request.method(), {
        entry,
        startTime: Date.now(),
      });
      console.log(`[API REQUEST] ${request.method()} ${url}`);
      if (entry.requestBody) {
        try {
          const body = JSON.parse(entry.requestBody);
          console.log(`[API REQUEST BODY]`, JSON.stringify(body, null, 2));
        } catch {
          console.log(`[API REQUEST BODY]`, entry.requestBody);
        }
      }
    }
  });

  page.on('response', async (response: Response) => {
    const url = response.url();
    const request = response.request();
    const key = url + request.method();
    const pending = pendingRequests.get(key);

    if (pending) {
      pending.entry.status = response.status();
      pending.entry.statusText = response.statusText();
      pending.entry.duration = Date.now() - pending.startTime;

      // Try to capture response body for API calls
      try {
        const contentType = response.headers()['content-type'] || '';
        if (contentType.includes('application/json')) {
          pending.entry.responseBody = await response.text();
        }
      } catch {
        // Response body not available
      }

      console.log(
        `[API RESPONSE] ${response.status()} ${request.method()} ${url} (${pending.entry.duration}ms)`
      );

      // Extract tax data from cart/order responses
      if (pending.entry.responseBody && (url.includes('/carts') || url.includes('/orders'))) {
        try {
          const responseJson = JSON.parse(pending.entry.responseBody);
          const data = responseJson.cart || responseJson.order;
          if (data && typeof data.tax_total === 'number') {
            const taxData: TaxApiData = {
              timestamp: new Date(),
              cartId: data.id,
              taxTotal: data.tax_total,
              total: data.total,
              subtotal: data.subtotal,
              shippingTotal: data.shipping_total,
              source: responseJson.cart ? 'cart' : 'order',
            };
            logs.taxData.push(taxData);
            console.log(
              `[TAX DATA] ${taxData.source}: tax_total=$${taxData.taxTotal}, total=$${taxData.total}, subtotal=$${taxData.subtotal}, shipping=$${taxData.shippingTotal}`
            );
          }
        } catch {
          // Ignore JSON parse errors
        }
      }

      if (response.status() >= 400) {
        logs.failures.push(pending.entry);
        console.error(`[API FAILURE] ${response.status()} ${url}`);
        if (pending.entry.responseBody) {
          try {
            const body = JSON.parse(pending.entry.responseBody);
            console.error(`[API ERROR BODY]`, JSON.stringify(body, null, 2));
          } catch {
            console.error(`[API ERROR BODY]`, pending.entry.responseBody);
          }
        }
      }

      pendingRequests.delete(key);
    }
  });

  page.on('requestfailed', (request: Request) => {
    const url = request.url();
    const failure = request.failure();
    const entry: NetworkEntry = {
      url,
      method: request.method(),
      error: failure?.errorText || 'Unknown error',
      timestamp: new Date(),
    };

    logs.all.push(entry);

    if (url.includes('api.optic.works') || url.includes('/store/')) {
      logs.failures.push(entry);
      console.error(`[API REQUEST FAILED] ${request.method()} ${url}: ${entry.error}`);
    }
  });

  return logs;
}

/**
 * Get a summary of network failures.
 */
export function getFailureSummary(logs: NetworkLogs): string {
  if (logs.failures.length === 0) {
    return 'No API failures captured';
  }

  return logs.failures
    .map((f) => {
      const status = f.status ? `${f.status} ${f.statusText}` : f.error;
      return `${f.method} ${f.url}: ${status}`;
    })
    .join('\n');
}

/**
 * Get all API calls with their status.
 */
export function getApiCallSummary(logs: NetworkLogs): string {
  if (logs.apiCalls.length === 0) {
    return 'No API calls captured';
  }

  return logs.apiCalls
    .map((call) => {
      const status = call.status ?? 'pending';
      const duration = call.duration ? `${call.duration}ms` : '';
      return `${call.method} ${call.url}: ${status} ${duration}`;
    })
    .join('\n');
}

/**
 * Get the latest tax data from network logs.
 */
export function getLatestTaxData(logs: NetworkLogs): TaxApiData | null {
  if (logs.taxData.length === 0) {
    return null;
  }
  return logs.taxData[logs.taxData.length - 1];
}

/**
 * Get a summary of all tax data captured.
 */
export function getTaxDataSummary(logs: NetworkLogs): string {
  if (logs.taxData.length === 0) {
    return 'No tax data captured';
  }

  return logs.taxData
    .map((data, index) => {
      return `[${index + 1}] ${data.source}: tax=$${data.taxTotal}, total=$${data.total}, subtotal=$${data.subtotal}, shipping=$${data.shippingTotal}`;
    })
    .join('\n');
}
