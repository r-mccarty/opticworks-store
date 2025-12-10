/**
 * Hookdeck webhook signature verification
 *
 * Uses Node.js crypto module for HMAC SHA256 signature verification.
 * Backend runs on Hetzner (Node.js), not Cloudflare Workers.
 *
 * @see docs/reference/FULFILLMENT_INBOUND
 */

import crypto from "crypto";

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
 * @returns True if signature is valid, false otherwise
 */
export function verifyHookdeckSignature(
  body: string,
  signature: string | null,
  signature2: string | null
): boolean {
  const secret = process.env.HOOKDECK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("[hookdeck] HOOKDECK_WEBHOOK_SECRET not configured");
    return false;
  }

  if (!signature) {
    console.error("[hookdeck] No signature provided");
    return false;
  }

  try {
    // Compute HMAC SHA256 signature
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(body);
    const computedSignature = hmac.digest("base64");

    // Use timing-safe comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const computedBuffer = Buffer.from(computedSignature);

    // Check primary signature
    if (
      sigBuffer.length === computedBuffer.length &&
      crypto.timingSafeEqual(sigBuffer, computedBuffer)
    ) {
      return true;
    }

    // Check secondary signature (for key rotation)
    if (signature2) {
      const sig2Buffer = Buffer.from(signature2);
      if (
        sig2Buffer.length === computedBuffer.length &&
        crypto.timingSafeEqual(sig2Buffer, computedBuffer)
      ) {
        return true;
      }
    }

    console.error("[hookdeck] Signature mismatch");
    return false;
  } catch (error) {
    console.error("[hookdeck] Verification error:", error);
    return false;
  }
}
