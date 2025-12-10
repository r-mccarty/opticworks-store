/**
 * EasyPost Webhook Endpoint
 *
 * Receives tracker events from EasyPost via Hookdeck.
 * Validates signature and triggers the handle-easypost-event workflow.
 *
 * Endpoint: POST /webhooks/easypost
 *
 * @see docs/reference/FULFILLMENT_INBOUND
 */

import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { verifyHookdeckSignature } from "../../../lib/hookdeck-verification";
import handleEasyPostEventWorkflow from "../../../workflows/handle-easypost-event";
import type { EasyPostWebhookPayload } from "../../../types/easypost-webhook";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const logger = req.scope.resolve("logger");

  logger.info("[easypost-webhook] Received webhook request");

  // Get raw body for signature verification
  const rawBody = JSON.stringify(req.body);

  // Development mode bypass (per FULFILLMENT_INBOUND spec)
  const isDev = process.env.NODE_ENV === "development";
  const bypassSignature = req.headers["x-dev-bypass"] === "true";

  if (!isDev || !bypassSignature) {
    // Verify Hookdeck signature
    const signature = req.headers["x-hookdeck-signature"] as string;
    const signature2 = (req.headers["x-hookdeck-signature-2"] as string) || null;

    const isValid = verifyHookdeckSignature(rawBody, signature, signature2);

    if (!isValid) {
      logger.error("[easypost-webhook] Invalid Hookdeck signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    logger.info("[easypost-webhook] Hookdeck signature verified");
  } else {
    logger.warn("[easypost-webhook] Signature verification bypassed (dev mode)");
  }

  // Parse payload
  const payload = req.body as EasyPostWebhookPayload;

  // Filter: Only process tracker.updated events
  if (payload.description !== "tracker.updated") {
    logger.info(
      `[easypost-webhook] Ignoring event: ${payload.description}`
    );
    return res.status(200).json({
      status: "ignored",
      reason: "not_tracker_updated",
      description: payload.description,
    });
  }

  // Log event details
  logger.info(
    `[easypost-webhook] Processing tracker.updated: ` +
      `tracking=${payload.result?.tracking_code}, ` +
      `status=${payload.result?.status}, ` +
      `mode=${payload.mode}`
  );

  // Trigger workflow
  try {
    const { result } = await handleEasyPostEventWorkflow(req.scope).run({
      input: { payload },
    });

    logger.info(
      `[easypost-webhook] Workflow completed: action=${result.action}`
    );

    return res.status(200).json({
      status: "processed",
      action: result.action,
      fulfillmentId: result.fulfillmentId,
    });
  } catch (error) {
    logger.error(`[easypost-webhook] Workflow error: ${error}`);

    // Always return 200 to prevent Hookdeck retry storms (per spec)
    return res.status(200).json({
      status: "error",
      message: "Internal processing error",
    });
  }
}
