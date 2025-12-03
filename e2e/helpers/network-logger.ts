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
