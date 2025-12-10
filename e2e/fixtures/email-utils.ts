/**
 * Email testing utilities using Mailosaur.
 * Allows E2E tests to verify that emails are actually sent and contain expected content.
 *
 * @see https://mailosaur.com/docs/api/
 */
import Mailosaur from 'mailosaur';
import { mailosaurConfig } from './test-data';

export interface EmailMessage {
  id: string;
  from: { email?: string; name?: string }[];
  to: { email?: string; name?: string }[];
  subject?: string;
  html?: {
    body?: string;
    links?: { href?: string; text?: string }[];
  };
  text?: {
    body?: string;
    links?: { href?: string; text?: string }[];
  };
}

/**
 * Create a Mailosaur client instance.
 * Returns null if API key is not configured.
 */
export function createMailosaurClient(): Mailosaur | null {
  if (!mailosaurConfig.apiKey) {
    console.warn('[Mailosaur] API key not configured, email testing disabled');
    return null;
  }
  return new Mailosaur(mailosaurConfig.apiKey);
}

/**
 * Wait for an email to arrive at the specified address.
 *
 * @param sentTo - Email address to check (must be a Mailosaur address)
 * @param options - Optional filters for subject or timeout
 * @returns The email message, or null if Mailosaur is not configured
 */
export async function waitForEmail(
  sentTo: string,
  options: {
    subject?: string;
    timeout?: number;
  } = {}
): Promise<EmailMessage | null> {
  const client = createMailosaurClient();
  if (!client) {
    console.log('[Mailosaur] Skipping email verification - not configured');
    return null;
  }

  const { subject, timeout = 30000 } = options;

  console.log(`[Mailosaur] Waiting for email to ${sentTo}${subject ? ` with subject "${subject}"` : ''}...`);

  try {
    const message = await client.messages.get(mailosaurConfig.serverId, {
      sentTo,
      subject,
    }, {
      timeout,
    });

    console.log(`[Mailosaur] Received email: "${message.subject}" from ${message.from?.[0]?.email}`);
    return message as EmailMessage;
  } catch (error) {
    console.error('[Mailosaur] Failed to receive email:', error);
    throw error;
  }
}

/**
 * Extract a link from an email by its text content.
 *
 * @param email - The email message to search
 * @param linkText - Text to search for in link text (case-insensitive)
 * @returns The href of the matching link, or undefined if not found
 */
export function extractLinkFromEmail(
  email: EmailMessage,
  linkText: string
): string | undefined {
  const links = email.html?.links || email.text?.links || [];
  const normalizedSearch = linkText.toLowerCase();

  const link = links.find(l =>
    l.text?.toLowerCase().includes(normalizedSearch)
  );

  return link?.href;
}

/**
 * Extract all links from an email.
 *
 * @param email - The email message
 * @returns Array of links with href and text
 */
export function extractAllLinks(
  email: EmailMessage
): { href?: string; text?: string }[] {
  return email.html?.links || email.text?.links || [];
}

/**
 * Check if an email contains specific text in its body.
 *
 * @param email - The email message
 * @param text - Text to search for (case-insensitive)
 * @returns true if the text is found
 */
export function emailContainsText(email: EmailMessage, text: string): boolean {
  const normalizedSearch = text.toLowerCase();
  const htmlBody = email.html?.body?.toLowerCase() || '';
  const textBody = email.text?.body?.toLowerCase() || '';

  return htmlBody.includes(normalizedSearch) || textBody.includes(normalizedSearch);
}

/**
 * Delete all messages in the Mailosaur server.
 * Useful for cleaning up between test runs.
 */
export async function deleteAllMessages(): Promise<void> {
  const client = createMailosaurClient();
  if (!client) return;

  console.log('[Mailosaur] Deleting all messages...');
  await client.messages.deleteAll(mailosaurConfig.serverId);
  console.log('[Mailosaur] All messages deleted');
}

/**
 * Check if Mailosaur is configured and available.
 */
export function isMailosaurConfigured(): boolean {
  return Boolean(mailosaurConfig.apiKey && mailosaurConfig.serverId);
}

/**
 * List recent messages from Mailosaur (useful for debugging).
 *
 * @param limit - Maximum number of messages to retrieve (default: 10)
 * @returns Array of recent messages, or empty if Mailosaur not configured
 */
export async function listRecentMessages(limit = 10): Promise<EmailMessage[]> {
  const client = createMailosaurClient();
  if (!client) {
    return [];
  }

  try {
    const result = await client.messages.list(mailosaurConfig.serverId, {
      page: 0,
      itemsPerPage: limit,
    });
    return (result.items || []) as EmailMessage[];
  } catch (error) {
    console.error('[Mailosaur] Failed to list messages:', error);
    return [];
  }
}

/**
 * Verify an email was delivered to a specific address.
 * Useful for quick verification without asserting on content.
 *
 * @param sentTo - Email address to check
 * @param options - Optional timeout settings
 * @returns true if email was delivered, false otherwise
 */
export async function verifyEmailDelivered(
  sentTo: string,
  options: { timeout?: number } = {}
): Promise<boolean> {
  try {
    const email = await waitForEmail(sentTo, { timeout: options.timeout || 30000 });
    return email !== null;
  } catch {
    return false;
  }
}

/**
 * Get all emails sent to a specific address (useful for testing multiple emails).
 *
 * @param sentTo - Email address to check
 * @returns Array of emails sent to the address
 */
export async function getEmailsFor(sentTo: string): Promise<EmailMessage[]> {
  const client = createMailosaurClient();
  if (!client) {
    return [];
  }

  try {
    const result = await client.messages.search(mailosaurConfig.serverId, {
      sentTo,
    });
    return (result.items || []) as EmailMessage[];
  } catch (error) {
    console.error('[Mailosaur] Failed to search messages:', error);
    return [];
  }
}
