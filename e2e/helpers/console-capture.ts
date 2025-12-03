import { Page, ConsoleMessage } from '@playwright/test';

export interface ConsoleEntry {
  type: string;
  text: string;
  timestamp: Date;
  location?: string;
}

export interface ConsoleLogs {
  errors: string[];
  warnings: string[];
  logs: string[];
  all: ConsoleEntry[];
}

/**
 * Create a console capture handler for a page.
 * Captures all browser console messages for debugging.
 */
export function createConsoleCapture(page: Page): ConsoleLogs {
  const logs: ConsoleLogs = {
    errors: [],
    warnings: [],
    logs: [],
    all: [],
  };

  page.on('console', (msg: ConsoleMessage) => {
    const entry: ConsoleEntry = {
      type: msg.type(),
      text: msg.text(),
      timestamp: new Date(),
      location: msg.location().url,
    };

    logs.all.push(entry);

    switch (msg.type()) {
      case 'error':
        logs.errors.push(msg.text());
        console.error(`[BROWSER ERROR] ${msg.text()}`);
        break;
      case 'warning':
        logs.warnings.push(msg.text());
        console.warn(`[BROWSER WARN] ${msg.text()}`);
        break;
      default:
        logs.logs.push(msg.text());
        // Only log messages with our debug prefixes
        if (
          msg.text().includes('[cart]') ||
          msg.text().includes('[medusa]') ||
          msg.text().includes('[checkout]')
        ) {
          console.log(`[BROWSER] ${msg.text()}`);
        }
    }
  });

  // Capture uncaught page errors
  page.on('pageerror', (error) => {
    const entry: ConsoleEntry = {
      type: 'pageerror',
      text: `Page Error: ${error.message}\n${error.stack || ''}`,
      timestamp: new Date(),
    };
    logs.all.push(entry);
    logs.errors.push(entry.text);
    console.error(`[PAGE ERROR] ${error.message}`);
  });

  return logs;
}

/**
 * Filter logs to only include Medusa/cart/checkout related messages.
 */
export function filterAppLogs(logs: ConsoleLogs): string[] {
  return logs.all
    .filter(
      (log) =>
        log.text.includes('[medusa]') ||
        log.text.includes('[cart]') ||
        log.text.includes('[checkout]')
    )
    .map((log) => `[${log.type}] ${log.text}`);
}

/**
 * Get a summary of console errors.
 */
export function getErrorSummary(logs: ConsoleLogs): string {
  if (logs.errors.length === 0) {
    return 'No console errors captured';
  }
  return `${logs.errors.length} errors:\n${logs.errors.join('\n---\n')}`;
}
