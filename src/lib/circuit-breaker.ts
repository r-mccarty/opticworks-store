/**
 * Circuit Breaker Pattern Implementation
 *
 * Prevents cascading failures by stopping API calls to failing services.
 *
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are blocked
 * - HALF_OPEN: Testing if service has recovered
 *
 * Transitions:
 * - CLOSED -> OPEN: After `failureThreshold` failures within `failureWindow`
 * - OPEN -> HALF_OPEN: After `resetTimeout` has passed
 * - HALF_OPEN -> CLOSED: On successful request
 * - HALF_OPEN -> OPEN: On failed request
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerConfig {
  /** Name of the service (for logging) */
  name: string;
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time window in ms to count failures */
  failureWindow: number;
  /** Time in ms before attempting recovery */
  resetTimeout: number;
  /** Optional callback when state changes */
  onStateChange?: (name: string, from: CircuitState, to: CircuitState) => void;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number[];
  lastFailure: number;
  lastStateChange: number;
}

// In-memory store for circuit states
// Note: In Cloudflare Workers, this is per-isolate so provides soft circuit breaking
const circuits = new Map<string, CircuitBreakerState>();

const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, 'name'> = {
  failureThreshold: 5,
  failureWindow: 60_000, // 1 minute
  resetTimeout: 300_000, // 5 minutes
};

function getCircuit(name: string): CircuitBreakerState {
  if (!circuits.has(name)) {
    circuits.set(name, {
      state: 'closed',
      failures: [],
      lastFailure: 0,
      lastStateChange: Date.now(),
    });
  }
  return circuits.get(name)!;
}

function setCircuitState(
  name: string,
  newState: CircuitState,
  config: CircuitBreakerConfig
): void {
  const circuit = getCircuit(name);
  const oldState = circuit.state;

  if (oldState !== newState) {
    circuit.state = newState;
    circuit.lastStateChange = Date.now();

    console.log(
      `[CircuitBreaker] ${name}: ${oldState} -> ${newState}`
    );

    if (config.onStateChange) {
      config.onStateChange(name, oldState, newState);
    }
  }
}

/**
 * Check if a request should be allowed through the circuit
 */
export function shouldAllowRequest(config: CircuitBreakerConfig): boolean {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const circuit = getCircuit(config.name);
  const now = Date.now();

  switch (circuit.state) {
    case 'closed':
      return true;

    case 'open':
      // Check if reset timeout has passed
      if (now - circuit.lastStateChange >= fullConfig.resetTimeout) {
        setCircuitState(config.name, 'half-open', fullConfig);
        return true; // Allow one test request
      }
      return false;

    case 'half-open':
      // Only allow one request at a time in half-open state
      return true;

    default:
      return true;
  }
}

/**
 * Record a successful request
 */
export function recordSuccess(config: CircuitBreakerConfig): void {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const circuit = getCircuit(config.name);

  if (circuit.state === 'half-open') {
    // Success in half-open state means service is recovered
    setCircuitState(config.name, 'closed', fullConfig);
    circuit.failures = [];
  }
}

/**
 * Record a failed request
 */
export function recordFailure(config: CircuitBreakerConfig): void {
  const fullConfig = { ...DEFAULT_CONFIG, ...config };
  const circuit = getCircuit(config.name);
  const now = Date.now();

  // Clean up old failures outside the window
  circuit.failures = circuit.failures.filter(
    (time) => now - time < fullConfig.failureWindow
  );

  // Add new failure
  circuit.failures.push(now);
  circuit.lastFailure = now;

  if (circuit.state === 'half-open') {
    // Failure in half-open state means service is still failing
    setCircuitState(config.name, 'open', fullConfig);
  } else if (circuit.state === 'closed') {
    // Check if we've hit the failure threshold
    if (circuit.failures.length >= fullConfig.failureThreshold) {
      setCircuitState(config.name, 'open', fullConfig);
    }
  }
}

/**
 * Get the current state of a circuit
 */
export function getCircuitState(name: string): CircuitState {
  return getCircuit(name).state;
}

/**
 * Get circuit statistics
 */
export function getCircuitStats(name: string): {
  state: CircuitState;
  recentFailures: number;
  lastFailure: number | null;
  lastStateChange: number;
} {
  const circuit = getCircuit(name);
  const now = Date.now();

  // Count only recent failures within the default window
  const recentFailures = circuit.failures.filter(
    (time) => now - time < DEFAULT_CONFIG.failureWindow
  ).length;

  return {
    state: circuit.state,
    recentFailures,
    lastFailure: circuit.lastFailure || null,
    lastStateChange: circuit.lastStateChange,
  };
}

/**
 * Reset a circuit to closed state (for testing/recovery)
 */
export function resetCircuit(name: string): void {
  circuits.delete(name);
}

/**
 * Pre-configured circuit breaker for EasyPost API
 */
export const EASYPOST_CIRCUIT: CircuitBreakerConfig = {
  name: 'easypost',
  failureThreshold: 5,
  failureWindow: 60_000, // 1 minute
  resetTimeout: 300_000, // 5 minutes
  onStateChange: (name, from, to) => {
    if (to === 'open') {
      console.warn(
        `[CircuitBreaker] EasyPost circuit OPENED after ${from} - falling back to mock rates`
      );
    } else if (to === 'closed') {
      console.log(`[CircuitBreaker] EasyPost circuit recovered`);
    }
  },
};

/**
 * Wrapper to execute a function with circuit breaker protection
 */
export async function withCircuitBreaker<T>(
  config: CircuitBreakerConfig,
  fn: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  if (!shouldAllowRequest(config)) {
    console.log(`[CircuitBreaker] ${config.name}: Request blocked (circuit open)`);
    return fallback();
  }

  try {
    const result = await fn();
    recordSuccess(config);
    return result;
  } catch (error) {
    recordFailure(config);
    console.error(`[CircuitBreaker] ${config.name}: Request failed`, error);
    return fallback();
  }
}
