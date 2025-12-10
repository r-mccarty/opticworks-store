/**
 * EasyPost webhook payload types
 * Based on FULFILLMENT_INBOUND architecture specification
 *
 * @see docs/reference/FULFILLMENT_INBOUND
 */

/**
 * EasyPost tracking status values
 * Maps to Medusa fulfillment state transitions
 */
export type EasyPostTrackingStatus =
  | "pre_transit" // Label created, awaiting carrier pickup
  | "in_transit" // Carrier has possession
  | "out_for_delivery" // Last mile delivery
  | "delivered" // Package delivered
  | "failure" // Delivery exception
  | "unknown"; // Unrecognized status

/**
 * EasyPost tracker result object
 * Contains tracking information from the carrier
 */
export interface EasyPostTrackerResult {
  /** Tracking code (e.g., "EZ1000000001") - PRIMARY lookup key */
  tracking_code: string;
  /** Current tracking status */
  status: string;
  /** EasyPost shipment ID (e.g., "shp_...") - SECONDARY lookup key */
  shipment_id: string;
  /** Carrier name (e.g., "USPS", "FedEx") */
  carrier: string;
  /** Public tracking URL */
  public_url: string;
  /** Estimated delivery date (ISO string) */
  est_delivery_date?: string;
  /** Last update timestamp (ISO string) */
  updated_at?: string;
}

/**
 * EasyPost webhook payload structure
 * Sent by EasyPost via Hookdeck
 */
export interface EasyPostWebhookPayload {
  /** Event description - filter for "tracker.updated" */
  description: string;
  /** Mode: "test" or "production" */
  mode: string;
  /** Tracker result data */
  result: EasyPostTrackerResult;
}

/**
 * Parsed event data extracted from webhook payload
 * Used internally by the workflow
 */
export interface ParsedEasyPostEvent {
  trackingCode: string;
  shipmentId: string;
  status: EasyPostTrackingStatus;
  carrier: string;
  trackingUrl: string;
  mode: "test" | "production";
  trackingDetails: {
    estimatedDeliveryDate?: string;
    lastUpdate?: string;
  };
}

/**
 * Result of the fulfillment status update
 */
export interface FulfillmentUpdateResult {
  action:
    | "no_action"
    | "marked_shipped"
    | "marked_delivered"
    | "logged_error"
    | "skipped";
  reason?: string;
  fulfillmentId?: string;
}
