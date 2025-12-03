import { Page, TestInfo } from '@playwright/test';
import { ConsoleLogs } from './console-capture';
import { NetworkLogs } from './network-logger';
import { getAllStorage } from './storage-inspector';

/**
 * Capture comprehensive debug information and attach to test report.
 * Call this on test failure to get full context for debugging.
 */
export async function captureDebugInfo(
  page: Page,
  testInfo: TestInfo,
  consoleLogs: ConsoleLogs,
  networkLogs: NetworkLogs,
  label: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const prefix = `${label}-${timestamp}`;

  console.log(`\n========== CAPTURING DEBUG INFO: ${label} ==========\n`);

  // 1. Screenshot
  try {
    const screenshot = await page.screenshot({ fullPage: true });
    await testInfo.attach(`${prefix}-screenshot`, {
      body: screenshot,
      contentType: 'image/png',
    });
    console.log('✓ Screenshot captured');
  } catch (error) {
    console.error('✗ Screenshot capture failed:', error);
  }

  // 2. Console logs
  try {
    await testInfo.attach(`${prefix}-console-logs`, {
      body: JSON.stringify(consoleLogs, null, 2),
      contentType: 'application/json',
    });
    console.log(`✓ Console logs captured (${consoleLogs.all.length} entries, ${consoleLogs.errors.length} errors)`);
  } catch (error) {
    console.error('✗ Console logs capture failed:', error);
  }

  // 3. Network logs
  try {
    await testInfo.attach(`${prefix}-network-logs`, {
      body: JSON.stringify(networkLogs, null, 2),
      contentType: 'application/json',
    });
    console.log(`✓ Network logs captured (${networkLogs.apiCalls.length} API calls, ${networkLogs.failures.length} failures)`);
  } catch (error) {
    console.error('✗ Network logs capture failed:', error);
  }

  // 4. localStorage
  try {
    const storage = await getAllStorage(page);
    await testInfo.attach(`${prefix}-localStorage`, {
      body: JSON.stringify(storage, null, 2),
      contentType: 'application/json',
    });
    console.log(`✓ localStorage captured (${Object.keys(storage).length} keys)`);
  } catch (error) {
    console.error('✗ localStorage capture failed:', error);
  }

  // 5. Current URL
  try {
    await testInfo.attach(`${prefix}-url`, {
      body: page.url(),
      contentType: 'text/plain',
    });
    console.log(`✓ Current URL: ${page.url()}`);
  } catch (error) {
    console.error('✗ URL capture failed:', error);
  }

  // 6. HTML snapshot
  try {
    const html = await page.content();
    await testInfo.attach(`${prefix}-html`, {
      body: html,
      contentType: 'text/html',
    });
    console.log('✓ HTML snapshot captured');
  } catch (error) {
    console.error('✗ HTML snapshot capture failed:', error);
  }

  console.log(`\n========== END DEBUG INFO: ${label} ==========\n`);
}

/**
 * Log a step in the test for visibility.
 */
export function logStep(step: number, description: string): void {
  console.log(`\n>>> STEP ${step}: ${description}`);
}

/**
 * Wait for network to be idle (no pending requests).
 */
export async function waitForNetworkIdle(page: Page, timeout = 5000): Promise<void> {
  try {
    await page.waitForLoadState('networkidle', { timeout });
  } catch {
    // Network idle timeout is not critical, continue
    console.log('[WARN] Network idle timeout, continuing...');
  }
}

/**
 * Wait for Medusa API to respond.
 */
export async function waitForMedusaResponse(
  page: Page,
  urlPattern: RegExp,
  timeout = 10000
): Promise<void> {
  await page.waitForResponse(
    (response) => urlPattern.test(response.url()) && response.status() < 400,
    { timeout }
  );
}
