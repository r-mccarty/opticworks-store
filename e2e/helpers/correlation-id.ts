/**
 * Correlation ID utilities for E2E test debugging.
 *
 * Injects correlation IDs into API requests made during tests,
 * enabling cross-referencing between test failures and backend logs.
 *
 * Usage:
 *   // In a test
 *   const testCorrelation = createTestCorrelation(testInfo);
 *   await setupCorrelationInterceptor(page, testCorrelation);
 *
 *   // ... run test ...
 *
 *   // On failure, logs show correlation ID to find in backend
 *   // grep "e2e-checkout-flow-abc123" /logs/medusa-app.log
 */
import { Page, APIRequestContext, TestInfo } from '@playwright/test';

export interface TestCorrelation {
  /** Unique correlation ID for this test run */
  correlationId: string;
  /** Test title (for logging) */
  testTitle: string;
  /** Test file name */
  testFile: string;
  /** Timestamp when test started */
  startTime: Date;
  /** All API requests made with this correlation ID */
  requests: CorrelatedRequest[];
}

export interface CorrelatedRequest {
  url: string;
  method: string;
  correlationId: string;
  timestamp: Date;
  status?: number;
  duration?: number;
}

/**
 * Create a correlation context for a test.
 * Call this at the start of each test to generate a unique correlation ID.
 */
export function createTestCorrelation(testInfo: TestInfo): TestCorrelation {
  // Generate a unique ID that's:
  // - Human-readable (includes test name)
  // - Unique (timestamp + random)
  // - Grep-friendly (no special chars)
  const sanitizedTitle = testInfo.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);

  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 6);
  const correlationId = `e2e-${sanitizedTitle}-${timestamp}-${random}`;

  const testFile = testInfo.file?.split('/').pop() || 'unknown';

  console.log(`\n[Correlation] Test: "${testInfo.title}"`);
  console.log(`[Correlation] ID: ${correlationId}`);
  console.log(`[Correlation] To find backend logs: grep "${correlationId}" /logs/medusa-app.log\n`);

  return {
    correlationId,
    testTitle: testInfo.title,
    testFile,
    startTime: new Date(),
    requests: [],
  };
}

/**
 * Set up request interceptor to inject correlation ID into all API requests.
 *
 * This intercepts browser requests (via page.route) and adds the correlation
 * ID header, allowing you to trace the test's requests in backend logs.
 */
export async function setupCorrelationInterceptor(
  page: Page,
  correlation: TestCorrelation
): Promise<void> {
  // Intercept requests to the API backend
  await page.route(/api\.optic\.works|localhost:9000/, async (route) => {
    const request = route.request();
    const url = request.url();
    const method = request.method();

    // Skip OPTIONS (CORS preflight)
    if (method === 'OPTIONS') {
      await route.continue();
      return;
    }

    const startTime = Date.now();

    // Track this request
    const correlatedRequest: CorrelatedRequest = {
      url,
      method,
      correlationId: correlation.correlationId,
      timestamp: new Date(),
    };
    correlation.requests.push(correlatedRequest);

    console.log(`[Correlation] ${method} ${url}`);
    console.log(`[Correlation]   x-correlation-id: ${correlation.correlationId}`);

    // Continue with added correlation header
    await route.continue({
      headers: {
        ...request.headers(),
        'x-correlation-id': correlation.correlationId,
      },
    });
  });
}

/**
 * Create an API request context with correlation ID headers.
 * Use this for direct API calls in tests (not through the browser).
 *
 * @example
 * const api = await createCorrelatedApiContext(request, correlation);
 * const response = await api.post('/store/carts', { data: { ... } });
 */
export async function createCorrelatedApiContext(
  request: APIRequestContext,
  correlation: TestCorrelation,
  baseURL?: string
): Promise<APIRequestContext> {
  // Note: Playwright's APIRequestContext doesn't support dynamic headers per-request
  // in a straightforward way, so we return a wrapper that logs the correlation

  console.log(`[Correlation] API context created with ID: ${correlation.correlationId}`);

  // For now, return the original context
  // The caller should manually add headers:
  //   request.post(url, { headers: { 'x-correlation-id': correlation.correlationId } })
  return request;
}

/**
 * Get headers object with correlation ID for manual fetch calls.
 */
export function getCorrelationHeaders(correlation: TestCorrelation): Record<string, string> {
  return {
    'x-correlation-id': correlation.correlationId,
  };
}

/**
 * Wrap fetch to automatically include correlation ID.
 * Use this for utility functions that make direct API calls.
 */
export function createCorrelatedFetch(
  correlation: TestCorrelation
): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input.toString();
    const method = init?.method || 'GET';

    const startTime = Date.now();

    // Track request
    const correlatedRequest: CorrelatedRequest = {
      url,
      method,
      correlationId: correlation.correlationId,
      timestamp: new Date(),
    };
    correlation.requests.push(correlatedRequest);

    console.log(`[Correlation] fetch ${method} ${url}`);

    // Make request with correlation header
    const response = await fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        'x-correlation-id': correlation.correlationId,
      },
    });

    // Update tracking
    correlatedRequest.status = response.status;
    correlatedRequest.duration = Date.now() - startTime;

    console.log(`[Correlation]   -> ${response.status} (${correlatedRequest.duration}ms)`);

    return response;
  };
}

/**
 * Generate a summary of all correlated requests for debugging.
 */
export function getCorrelationSummary(correlation: TestCorrelation): string {
  const lines = [
    `=== Correlation Summary ===`,
    `Test: ${correlation.testTitle}`,
    `File: ${correlation.testFile}`,
    `Correlation ID: ${correlation.correlationId}`,
    `Started: ${correlation.startTime.toISOString()}`,
    ``,
    `Backend Log Command:`,
    `  grep "${correlation.correlationId}" /opt/opticworks/medusa-backend/logs/medusa-app.log`,
    ``,
    `Requests (${correlation.requests.length}):`,
  ];

  for (const req of correlation.requests) {
    const status = req.status ? `${req.status}` : 'pending';
    const duration = req.duration ? `${req.duration}ms` : '';
    lines.push(`  ${req.method} ${req.url} -> ${status} ${duration}`);
  }

  return lines.join('\n');
}

/**
 * Attach correlation summary to test report on failure.
 */
export async function attachCorrelationToReport(
  testInfo: TestInfo,
  correlation: TestCorrelation
): Promise<void> {
  const summary = getCorrelationSummary(correlation);

  // Log to console
  console.log('\n' + summary + '\n');

  // Attach to Playwright report
  await testInfo.attach('correlation-summary', {
    body: summary,
    contentType: 'text/plain',
  });

  // Attach as JSON for programmatic access
  await testInfo.attach('correlation-data', {
    body: JSON.stringify(correlation, null, 2),
    contentType: 'application/json',
  });
}

/**
 * Helper to log the correlation ID prominently on test failure.
 * Call this in a test's catch block or afterEach hook.
 */
export function logCorrelationOnFailure(
  correlation: TestCorrelation,
  error?: Error
): void {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST FAILED - DEBUG INFO                   ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ Correlation ID: ${correlation.correlationId.padEnd(45)} ║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ Find backend logs:                                           ║');
  console.log(`║   grep "${correlation.correlationId}" \\                       `);
  console.log('║     /opt/opticworks/medusa-backend/logs/medusa-app.log        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║ In Sentry, filter by tag:                                    ║');
  console.log(`║   correlation_id:${correlation.correlationId.padEnd(44)} ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (error) {
    console.log('\nError:', error.message);
  }
  console.log('\n');
}
