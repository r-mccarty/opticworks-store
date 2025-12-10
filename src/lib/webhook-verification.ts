/**
 * Webhook signature verification utilities
 *
 * Provides Cloudflare Workers-compatible signature verification for Hookdeck webhooks
 * using the Web Crypto API (SubtleCrypto).
 */

/**
 * Verifies a Hookdeck webhook signature using HMAC SHA256.
 *
 * Hookdeck signs webhook requests with an HMAC SHA256 signature using the project's
 * signing secret. This function verifies that signature to ensure the request
 * genuinely originated from Hookdeck.
 *
 * @param body - The raw request body as a string
 * @param signature - The x-hookdeck-signature header value
 * @param signature2 - The x-hookdeck-signature-2 header value (used during key rotation)
 * @returns Promise<boolean> - True if signature is valid, false otherwise
 */
export async function verifyHookdeckSignature(
  body: string,
  signature: string | null,
  signature2: string | null
): Promise<boolean> {
  const secret = process.env.HOOKDECK_WEBHOOK_SECRET;

  if (!secret) {
    console.error('❌ HOOKDECK_WEBHOOK_SECRET not configured');
    return false;
  }

  if (!signature) {
    console.error('❌ No Hookdeck signature provided');
    return false;
  }

  try {
    // Use Web Crypto API for Cloudflare Workers compatibility
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(body);

    // Import the secret as an HMAC key
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the message
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);

    // Convert to base64
    const computedSignature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer))
    );

    // Compare with provided signatures (check both for key rotation support)
    if (computedSignature === signature) {
      return true;
    }

    if (signature2 && computedSignature === signature2) {
      return true;
    }

    console.error('❌ Hookdeck signature mismatch');
    return false;
  } catch (error) {
    console.error('❌ Error verifying Hookdeck signature:', error);
    return false;
  }
}
