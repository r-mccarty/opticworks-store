/**
 * Handle EasyPost Tracker Event Workflow
 *
 * Processes inbound tracker.updated events from EasyPost via Hookdeck.
 * Updates fulfillment status based on tracking state machine.
 *
 * @see docs/reference/FULFILLMENT_INBOUND
 */

import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import type {
  EasyPostWebhookPayload,
  EasyPostTrackingStatus,
  ParsedEasyPostEvent,
  FulfillmentUpdateResult,
} from "../types/easypost-webhook";

// ============================================================================
// Step 1: Parse EasyPost Payload
// ============================================================================

const parseEasyPostPayloadStep = createStep(
  "parse-easypost-payload",
  async (input: { payload: EasyPostWebhookPayload }) => {
    const { result } = input.payload;

    const parsed: ParsedEasyPostEvent = {
      trackingCode: result.tracking_code,
      shipmentId: result.shipment_id,
      status: result.status as EasyPostTrackingStatus,
      carrier: result.carrier,
      trackingUrl: result.public_url,
      mode: input.payload.mode as "test" | "production",
      trackingDetails: {
        estimatedDeliveryDate: result.est_delivery_date,
        lastUpdate: result.updated_at,
      },
    };

    return new StepResponse(parsed);
  }
);

// ============================================================================
// Step 2: Lookup Fulfillment
// ============================================================================

interface FulfillmentRecord {
  id: string;
  data: Record<string, unknown>;
  shipped_at: string | null;
  delivered_at: string | null;
  labels: Array<{ tracking_number: string }>;
}

const lookupFulfillmentStep = createStep(
  "lookup-fulfillment",
  async (
    input: ParsedEasyPostEvent,
    { container }
  ): Promise<StepResponse<FulfillmentRecord | null>> => {
    const logger = container.resolve("logger");
    const fulfillmentService = container.resolve(Modules.FULFILLMENT);

    logger.info(
      `[easypost-webhook] Looking up fulfillment for tracking: ${input.trackingCode}`
    );

    try {
      // List all fulfillments and filter by tracking_code or shipment_id
      // Note: Medusa's query doesn't support JSON field filtering directly
      const fulfillments = await fulfillmentService.listFulfillments({});

      // Find matching fulfillment
      const fulfillment = fulfillments.find((f: FulfillmentRecord) => {
        const data = f.data as Record<string, unknown>;
        return (
          data?.tracking_code === input.trackingCode ||
          data?.easypost_shipment_id === input.shipmentId
        );
      });

      if (!fulfillment) {
        // Per spec: Log warning but don't fail - return 200 OK
        logger.warn(
          `[easypost-webhook] Fulfillment not found for tracking: ${input.trackingCode}, shipment: ${input.shipmentId}`
        );
        return new StepResponse(null);
      }

      logger.info(
        `[easypost-webhook] Found fulfillment ${fulfillment.id} for tracking: ${input.trackingCode}`
      );

      return new StepResponse(fulfillment as FulfillmentRecord);
    } catch (error) {
      logger.error(`[easypost-webhook] Lookup error: ${error}`);
      return new StepResponse(null);
    }
  }
);

// ============================================================================
// Step 3: Update Fulfillment Status (State Machine)
// ============================================================================

interface UpdateStatusInput {
  fulfillment: FulfillmentRecord | null;
  event: ParsedEasyPostEvent;
}

const updateFulfillmentStatusStep = createStep(
  "update-fulfillment-status",
  async (
    input: UpdateStatusInput,
    { container }
  ): Promise<StepResponse<FulfillmentUpdateResult>> => {
    const { fulfillment, event } = input;
    const logger = container.resolve("logger");

    // Skip if no fulfillment found
    if (!fulfillment) {
      return new StepResponse({
        action: "skipped",
        reason: "fulfillment_not_found",
      });
    }

    const fulfillmentService = container.resolve(Modules.FULFILLMENT);

    // State Machine Logic (from FULFILLMENT_INBOUND spec)
    switch (event.status) {
      case "pre_transit":
        // No action - label created but not shipped
        logger.info(
          `[easypost-webhook] ${fulfillment.id}: pre_transit - no action`
        );
        return new StepResponse({
          action: "no_action",
          fulfillmentId: fulfillment.id,
        });

      case "in_transit": {
        // IDEMPOTENCY CHECK: Check shipped_at
        if (fulfillment.shipped_at) {
          logger.info(
            `[easypost-webhook] ${fulfillment.id}: already shipped at ${fulfillment.shipped_at}`
          );
          return new StepResponse({
            action: "no_action",
            reason: "already_shipped",
            fulfillmentId: fulfillment.id,
          });
        }

        // Mark as shipped by updating shipped_at
        const now = new Date();
        await fulfillmentService.updateFulfillment(fulfillment.id, {
          shipped_at: now,
        });

        logger.info(
          `[easypost-webhook] ${fulfillment.id}: marked as shipped`
        );
        return new StepResponse({
          action: "marked_shipped",
          fulfillmentId: fulfillment.id,
        });
      }

      case "out_for_delivery":
        // Future: SMS notification hook
        logger.info(
          `[easypost-webhook] ${fulfillment.id}: out_for_delivery - no action (future SMS)`
        );
        return new StepResponse({
          action: "no_action",
          fulfillmentId: fulfillment.id,
        });

      case "delivered": {
        const now = new Date();

        // RACE CONDITION: Handle delivered before in_transit
        if (!fulfillment.shipped_at) {
          logger.info(
            `[easypost-webhook] ${fulfillment.id}: delivered but not shipped - marking shipped first`
          );
          await fulfillmentService.updateFulfillment(fulfillment.id, {
            shipped_at: now,
          });
        }

        // Mark as delivered by updating data field and delivered_at
        const updatedData = {
          ...(fulfillment.data as Record<string, unknown>),
          delivery_status: "delivered",
          delivered_at: now.toISOString(),
        };

        await fulfillmentService.updateFulfillment(fulfillment.id, {
          data: updatedData,
          delivered_at: now,
        });

        logger.info(
          `[easypost-webhook] ${fulfillment.id}: marked as delivered`
        );
        return new StepResponse({
          action: "marked_delivered",
          fulfillmentId: fulfillment.id,
        });
      }

      case "failure":
        // Log error - don't fail the webhook
        logger.error(
          `[easypost-webhook] ${fulfillment.id}: tracking failure reported by carrier`
        );
        return new StepResponse({
          action: "logged_error",
          reason: "tracking_failure",
          fulfillmentId: fulfillment.id,
        });

      default:
        logger.warn(
          `[easypost-webhook] ${fulfillment.id}: unknown status "${event.status}"`
        );
        return new StepResponse({
          action: "no_action",
          reason: `unknown_status_${event.status}`,
          fulfillmentId: fulfillment.id,
        });
    }
  }
);

// ============================================================================
// Step 4: Log Tracking Event
// ============================================================================

interface LogEventInput {
  event: ParsedEasyPostEvent;
  result: FulfillmentUpdateResult;
}

const logTrackingEventStep = createStep(
  "log-tracking-event",
  async (input: LogEventInput, { container }) => {
    const logger = container.resolve("logger");
    const { event, result } = input;

    logger.info(
      `[easypost-webhook] Event processed: ` +
        `tracking=${event.trackingCode}, ` +
        `status=${event.status}, ` +
        `action=${result.action}, ` +
        `fulfillment=${result.fulfillmentId || "none"}`
    );

    return new StepResponse({ logged: true });
  }
);

// ============================================================================
// Main Workflow
// ============================================================================

type HandleEasyPostEventInput = {
  payload: EasyPostWebhookPayload;
};

const handleEasyPostEventWorkflow = createWorkflow(
  "handle-easypost-event",
  (input: HandleEasyPostEventInput) => {
    // Step 1: Parse and validate payload
    const parsedEvent = parseEasyPostPayloadStep({ payload: input.payload });

    // Step 2: Lookup fulfillment by tracking_code or shipment_id
    const fulfillment = lookupFulfillmentStep(parsedEvent);

    // Step 3: Update fulfillment status based on state machine
    const updateResult = updateFulfillmentStatusStep({
      fulfillment,
      event: parsedEvent,
    });

    // Step 4: Log the event for observability
    logTrackingEventStep({
      event: parsedEvent,
      result: updateResult,
    });

    return new WorkflowResponse(updateResult);
  }
);

export default handleEasyPostEventWorkflow;
