/**
 * Retry Utility with Exponential Backoff
 *
 * Provides robust retry logic for handling transient failures when
 * communicating with the Medusa API or other services.
 *
 * Addresses RFD-004 Issue #3: Fetch/connection inconsistencies
 */

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;
  /** Initial delay in milliseconds */
  initialDelay?: number;
  /** Maximum delay in milliseconds */
  maxDelay?: number;
  /** Backoff multiplier (exponential) */
  backoffMultiplier?: number;
  /** Whether to add random jitter to delays */
  jitter?: boolean;
  /** Custom function to determine if error is retryable */
  isRetryable?: (error: Error) => boolean;
  /** Callback for each retry attempt */
  onRetry?: (attempt: number, error: Error, delay: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 5,
  initialDelay: 1000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  jitter: true,
  isRetryable: (error: Error) => {
    // Retry on network errors and 5xx responses
    const message = error.message.toLowerCase();
    return (
      message.includes('econnrefused') ||
      message.includes('econnreset') ||
      message.includes('etimedout') ||
      message.includes('network') ||
      message.includes('fetch failed') ||
      message.includes('503') ||
      message.includes('502') ||
      message.includes('500')
    );
  },
  onRetry: () => {},
};

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(
  attempt: number,
  initialDelay: number,
  maxDelay: number,
  backoffMultiplier: number,
  jitter: boolean
): number {
  const exponentialDelay = initialDelay * Math.pow(backoffMultiplier, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, maxDelay);

  if (jitter) {
    // Add random jitter between 0-25% of the delay
    const jitterAmount = cappedDelay * 0.25 * Math.random();
    return cappedDelay + jitterAmount;
  }

  return cappedDelay;
}

/**
 * Sleep for the specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 *
 * @param operation - The async operation to retry
 * @param options - Retry configuration options
 * @returns Result of the operation
 * @throws Last error if all retries are exhausted
 *
 * @example
 * ```typescript
 * const data = await retry(
 *   async () => {
 *     const response = await fetch('http://localhost:9000/store/products');
 *     if (!response.ok) throw new Error(`HTTP ${response.status}`);
 *     return response.json();
 *   },
 *   {
 *     maxAttempts: 3,
 *     onRetry: (attempt, error, delay) => {
 *       console.log(`Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms...`);
 *     }
 *   }
 * );
 * ```
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      const shouldRetry = opts.isRetryable(lastError);
      const isLastAttempt = attempt === opts.maxAttempts;

      if (!shouldRetry || isLastAttempt) {
        throw lastError;
      }

      // Calculate delay and wait
      const delay = calculateDelay(
        attempt,
        opts.initialDelay,
        opts.maxDelay,
        opts.backoffMultiplier,
        opts.jitter
      );

      opts.onRetry(attempt, lastError, delay);

      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript needs it
  throw lastError!;
}

/**
 * Retry a fetch request with better error handling
 *
 * @param url - URL to fetch
 * @param init - Fetch options
 * @param options - Retry configuration
 * @returns Response object
 *
 * @example
 * ```typescript
 * const response = await retryFetch(
 *   'http://localhost:9000/admin/products',
 *   {
 *     headers: { Authorization: 'Bearer token' }
 *   },
 *   { maxAttempts: 3 }
 * );
 * ```
 */
export async function retryFetch(
  url: string,
  init?: RequestInit,
  options: RetryOptions = {}
): Promise<Response> {
  return retry(
    async () => {
      const response = await fetch(url, init);

      // Treat 5xx as retryable errors
      if (response.status >= 500) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    },
    {
      ...options,
      isRetryable: (error: Error) => {
        const defaultRetryable = DEFAULT_OPTIONS.isRetryable(error);
        const customRetryable = options.isRetryable?.(error) ?? true;
        return defaultRetryable && customRetryable;
      },
    }
  );
}

/**
 * Wait for a service to become available
 *
 * @param checkFn - Function that returns true when service is ready
 * @param options - Retry configuration
 * @returns True when service is ready
 *
 * @example
 * ```typescript
 * await waitForService(
 *   async () => {
 *     try {
 *       const response = await fetch('http://localhost:9000/health');
 *       return response.ok;
 *     } catch {
 *       return false;
 *     }
 *   },
 *   { maxAttempts: 30, initialDelay: 2000 }
 * );
 * ```
 */
export async function waitForService(
  checkFn: () => Promise<boolean>,
  options: RetryOptions = {}
): Promise<boolean> {
  return retry(
    async () => {
      const isReady = await checkFn();
      if (!isReady) {
        throw new Error('Service not ready');
      }
      return true;
    },
    {
      ...options,
      isRetryable: () => true, // Always retry for service checks
    }
  );
}
