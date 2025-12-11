import { Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * QA Artifact Logger
 *
 * Generates human-readable, data-oriented logs for QA verification.
 * Captures all state changes, API calls, and checkpoints during test execution.
 *
 * Artifacts are always generated (for all test runs) and stored in e2e/artifacts/.
 */

export interface QAArtifact {
  testName: string;
  testFile: string;
  timestamp: string;
  duration: number;
  checkpoints: QACheckpoint[];
  apiCalls: QAApiCall[];
  stateChanges: QAStateChange[];
  screenshots: QAScreenshot[];
  taxCalculation?: QATaxCalculation;
  orderSummary?: QAOrderSummary;
  errors: QAError[];
  outcome: 'pass' | 'fail' | 'skip';
}

export interface QACheckpoint {
  step: number;
  name: string;
  timestamp: string;
  elapsedMs: number;
  screenshotPath?: string;
  data?: Record<string, unknown>;
}

export interface QAApiCall {
  timestamp: string;
  elapsedMs: number;
  method: string;
  url: string;
  requestBody?: unknown;
  status?: number;
  responseBody?: unknown;
  duration?: number;
  category: 'cart' | 'shipping' | 'tax' | 'payment' | 'order' | 'other';
}

export interface QAStateChange {
  timestamp: string;
  elapsedMs: number;
  field: string;
  oldValue: unknown;
  newValue: unknown;
  trigger: string;
}

export interface QATaxCalculation {
  address: {
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  taxRate?: number;
  calculationId?: string;
  apiCallTimestamp?: string;
}

export interface QAOrderSummary {
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  verificationPassed: boolean;
}

export interface QAScreenshot {
  step: string;
  timestamp: string;
  path: string;
}

export interface QAError {
  timestamp: string;
  elapsedMs: number;
  step: string;
  message: string;
  stack?: string;
  screenshot?: string;
}

/**
 * Categorize an API call based on its URL.
 */
function categorizeApiCall(url: string): QAApiCall['category'] {
  if (url.includes('/shipping-options') || url.includes('/shipping-methods')) {
    return 'shipping';
  }
  if (url.includes('/payment')) {
    return 'payment';
  }
  if (url.includes('/orders')) {
    return 'order';
  }
  if (url.includes('/carts')) {
    // Cart calls may include tax data in response
    return 'cart';
  }
  return 'other';
}

/**
 * Format a timestamp for display.
 */
function formatTimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * Format elapsed time for display.
 */
function formatElapsed(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Create a QA artifact logger for a test.
 */
export function createQAArtifactLogger(testName: string, testFile: string): QAArtifactLogger {
  return new QAArtifactLogger(testName, testFile);
}

/**
 * QA Artifact Logger class.
 * Tracks test execution and generates detailed artifacts.
 */
export class QAArtifactLogger {
  private testName: string;
  private testFile: string;
  private startTime: Date;
  private checkpoints: QACheckpoint[] = [];
  private apiCalls: QAApiCall[] = [];
  private stateChanges: QAStateChange[] = [];
  private screenshots: QAScreenshot[] = [];
  private errors: QAError[] = [];
  private taxCalculation?: QATaxCalculation;
  private orderSummary?: QAOrderSummary;
  private stepCounter = 0;

  constructor(testName: string, testFile: string) {
    this.testName = testName;
    this.testFile = testFile;
    this.startTime = new Date();
  }

  /**
   * Get elapsed time since test start.
   */
  private getElapsed(): number {
    return Date.now() - this.startTime.getTime();
  }

  /**
   * Log a checkpoint (step) in the test.
   */
  checkpoint(name: string, data?: Record<string, unknown>): void {
    this.stepCounter++;
    const checkpoint: QACheckpoint = {
      step: this.stepCounter,
      name,
      timestamp: formatTimestamp(new Date()),
      elapsedMs: this.getElapsed(),
      data,
    };
    this.checkpoints.push(checkpoint);
    console.log(`[QA] [${this.stepCounter}] ${name} (+${formatElapsed(checkpoint.elapsedMs)})`);
  }

  /**
   * Log an API call.
   */
  logApiCall(call: Omit<QAApiCall, 'timestamp' | 'elapsedMs' | 'category'>): void {
    const apiCall: QAApiCall = {
      ...call,
      timestamp: formatTimestamp(new Date()),
      elapsedMs: this.getElapsed(),
      category: categorizeApiCall(call.url),
    };
    this.apiCalls.push(apiCall);

    // Check if this is a cart response with tax_total
    if (apiCall.category === 'cart' && apiCall.responseBody) {
      const response = apiCall.responseBody as Record<string, unknown>;
      if (response.cart && typeof (response.cart as Record<string, unknown>).tax_total === 'number') {
        const cart = response.cart as Record<string, unknown>;
        console.log(`[QA] Tax detected in cart response: $${cart.tax_total}`);
      }
    }
  }

  /**
   * Log a state change.
   */
  logStateChange(field: string, oldValue: unknown, newValue: unknown, trigger: string): void {
    const change: QAStateChange = {
      timestamp: formatTimestamp(new Date()),
      elapsedMs: this.getElapsed(),
      field,
      oldValue,
      newValue,
      trigger,
    };
    this.stateChanges.push(change);
    console.log(`[QA] State change: ${field} = ${JSON.stringify(newValue)} (was ${JSON.stringify(oldValue)})`);
  }

  /**
   * Capture a screenshot at a checkpoint.
   */
  async captureScreenshot(page: Page, stepName: string): Promise<string | undefined> {
    try {
      const artifactsDir = path.join(process.cwd(), 'e2e', 'artifacts', 'screenshots');

      // Ensure directory exists
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const safeName = this.testName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const safeStep = stepName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const filename = `${safeName}-${safeStep}-${timestamp}.png`;
      const filepath = path.join(artifactsDir, filename);

      await page.screenshot({ path: filepath, fullPage: true });

      const screenshot: QAScreenshot = {
        step: stepName,
        timestamp: formatTimestamp(new Date()),
        path: filepath,
      };
      this.screenshots.push(screenshot);

      // Update the last checkpoint with screenshot path
      if (this.checkpoints.length > 0) {
        this.checkpoints[this.checkpoints.length - 1].screenshotPath = filepath;
      }

      console.log(`[QA] Screenshot captured: ${filename}`);
      return filepath;
    } catch (error) {
      console.error(`[QA] Failed to capture screenshot: ${error}`);
      return undefined;
    }
  }

  /**
   * Set tax calculation details.
   */
  setTaxCalculation(tax: QATaxCalculation): void {
    this.taxCalculation = tax;
    console.log(
      `[QA] Tax calculation: $${tax.taxAmount} (${tax.taxRate ? tax.taxRate.toFixed(2) + '%' : 'rate unknown'}) for ${tax.address.city}, ${tax.address.state}`
    );
  }

  /**
   * Set order summary verification results.
   */
  setOrderSummary(summary: QAOrderSummary): void {
    this.orderSummary = summary;
    console.log(
      `[QA] Order summary: subtotal=$${summary.subtotal}, shipping=$${summary.shipping}, tax=$${summary.tax}, total=$${summary.total}, math=${summary.verificationPassed ? 'PASS' : 'FAIL'}`
    );
  }

  /**
   * Log an error.
   */
  logError(step: string, error: Error, screenshotPath?: string): void {
    const qaError: QAError = {
      timestamp: formatTimestamp(new Date()),
      elapsedMs: this.getElapsed(),
      step,
      message: error.message,
      stack: error.stack,
      screenshot: screenshotPath,
    };
    this.errors.push(qaError);
    console.error(`[QA] Error at "${step}": ${error.message}`);
  }

  /**
   * Finalize the artifact and return it.
   */
  finalize(outcome: 'pass' | 'fail' | 'skip'): QAArtifact {
    const artifact: QAArtifact = {
      testName: this.testName,
      testFile: this.testFile,
      timestamp: formatTimestamp(this.startTime),
      duration: this.getElapsed(),
      checkpoints: this.checkpoints,
      apiCalls: this.apiCalls,
      stateChanges: this.stateChanges,
      screenshots: this.screenshots,
      taxCalculation: this.taxCalculation,
      orderSummary: this.orderSummary,
      errors: this.errors,
      outcome,
    };

    // Write artifact to file
    this.writeArtifactFiles(artifact);

    return artifact;
  }

  /**
   * Write artifact files to disk.
   */
  private writeArtifactFiles(artifact: QAArtifact): void {
    try {
      const artifactsDir = path.join(process.cwd(), 'e2e', 'artifacts');

      // Ensure directory exists
      if (!fs.existsSync(artifactsDir)) {
        fs.mkdirSync(artifactsDir, { recursive: true });
      }

      const timestamp = this.startTime.toISOString().replace(/[:.]/g, '-');
      const safeName = this.testName.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
      const baseFilename = `${safeName}-${timestamp}`;

      // Write JSON artifact
      const jsonPath = path.join(artifactsDir, `${baseFilename}.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(artifact, null, 2));
      console.log(`[QA] JSON artifact written: ${jsonPath}`);

      // Write human-readable report
      const reportPath = path.join(artifactsDir, `${baseFilename}.txt`);
      fs.writeFileSync(reportPath, this.generateReport(artifact));
      console.log(`[QA] Report written: ${reportPath}`);
    } catch (error) {
      console.error(`[QA] Failed to write artifact files: ${error}`);
    }
  }

  /**
   * Generate a human-readable report from the artifact.
   */
  generateReport(artifact?: QAArtifact): string {
    const a = artifact || this.finalize('pass');
    const lines: string[] = [];

    const divider = '='.repeat(80);
    const subDivider = '-'.repeat(80);

    lines.push(divider);
    lines.push('QA ARTIFACT REPORT');
    lines.push(divider);
    lines.push(`Test: ${a.testFile} > ${a.testName}`);
    lines.push(`Date: ${a.timestamp}`);
    lines.push(`Duration: ${(a.duration / 1000).toFixed(1)} seconds`);
    lines.push(`Outcome: ${a.outcome.toUpperCase()}`);
    lines.push('');

    // Checkpoints
    lines.push(divider);
    lines.push('CHECKPOINTS');
    lines.push(divider);
    for (const cp of a.checkpoints) {
      lines.push(`[${cp.step}] ${cp.name} (+${formatElapsed(cp.elapsedMs)})`);
      if (cp.data) {
        for (const [key, value] of Object.entries(cp.data)) {
          lines.push(`    ${key}: ${JSON.stringify(value)}`);
        }
      }
      if (cp.screenshotPath) {
        lines.push(`    Screenshot: ${path.basename(cp.screenshotPath)}`);
      }
      lines.push('');
    }

    // Tax Calculation Details
    if (a.taxCalculation) {
      lines.push(divider);
      lines.push('TAX CALCULATION DETAILS');
      lines.push(divider);
      const t = a.taxCalculation;
      lines.push(`Address: ${t.address.city}, ${t.address.state} ${t.address.postalCode}, ${t.address.country}`);
      lines.push(`Subtotal: $${t.subtotal.toFixed(2)}`);
      lines.push(`Shipping: $${t.shippingCost.toFixed(2)}`);
      lines.push(`Tax Amount: $${t.taxAmount.toFixed(2)}`);
      if (t.taxRate !== undefined) {
        lines.push(`Tax Rate: ${t.taxRate.toFixed(2)}%`);
      }
      if (t.calculationId) {
        lines.push(`Stripe Calculation ID: ${t.calculationId}`);
      }
      lines.push('');
    }

    // Order Summary Verification
    if (a.orderSummary) {
      lines.push(divider);
      lines.push('ORDER SUMMARY VERIFICATION');
      lines.push(divider);
      const o = a.orderSummary;
      lines.push(`Subtotal:  $${o.subtotal.toFixed(2)}`);
      lines.push(`Shipping:  $${o.shipping.toFixed(2)}`);
      lines.push(`Tax:       $${o.tax.toFixed(2)}`);
      lines.push(`Total:     $${o.total.toFixed(2)}`);
      const expected = o.subtotal + o.shipping + o.tax;
      lines.push(
        `Math Check: ${o.verificationPassed ? 'PASS' : 'FAIL'} (${o.subtotal.toFixed(2)} + ${o.shipping.toFixed(2)} + ${o.tax.toFixed(2)} = ${expected.toFixed(2)})`
      );
      lines.push('');
    }

    // API Calls
    lines.push(divider);
    lines.push('API CALLS');
    lines.push(divider);
    for (const call of a.apiCalls) {
      const time = new Date(call.timestamp).toISOString().split('T')[1].split('.')[0];
      const status = call.status ? `${call.status}` : 'pending';
      const duration = call.duration ? `(${call.duration}ms)` : '';
      lines.push(`[${time}] ${call.method} ${call.url.replace(/https?:\/\/[^/]+/, '')} -> ${status} ${duration}`);

      // Show response body for cart calls with tax
      if (call.category === 'cart' && call.responseBody) {
        const response = call.responseBody as Record<string, unknown>;
        if (response.cart) {
          const cart = response.cart as Record<string, unknown>;
          if (cart.tax_total !== undefined) {
            lines.push(`           Response: { tax_total: ${cart.tax_total}, total: ${cart.total} }`);
          }
        }
      }
    }
    lines.push('');

    // Errors
    if (a.errors.length > 0) {
      lines.push(divider);
      lines.push('ERRORS');
      lines.push(divider);
      for (const err of a.errors) {
        lines.push(`[${err.step}] ${err.message}`);
        if (err.screenshot) {
          lines.push(`    Screenshot: ${path.basename(err.screenshot)}`);
        }
      }
      lines.push('');
    } else {
      lines.push(divider);
      lines.push('ERRORS');
      lines.push(divider);
      lines.push('(none)');
      lines.push('');
    }

    lines.push(divider);
    lines.push('END OF REPORT');
    lines.push(divider);

    return lines.join('\n');
  }
}
