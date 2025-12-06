/**
 * Fulfillment API Client
 *
 * Functions for creating shipping labels and managing fulfillment.
 */

import type { CreateLabelResponse } from '@/app/api/fulfillment/create-label/route';
import type { PurchasedLabel } from './easypost';

/**
 * Create a shipping label for an order
 *
 * @param shipmentId - EasyPost shipment ID (from getShippingRates)
 * @param rateId - EasyPost rate ID (user's selected rate)
 * @param orderId - Optional Medusa order ID for tracking
 */
export async function createShippingLabel(
  shipmentId: string,
  rateId: string,
  orderId?: string
): Promise<{ success: boolean; label?: PurchasedLabel; errors?: string[] }> {
  try {
    const response = await fetch('/api/fulfillment/create-label', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        shipmentId,
        rateId,
        orderId,
      }),
    });

    const data: CreateLabelResponse = await response.json();

    return {
      success: data.success,
      label: data.label,
      errors: data.errors,
    };

  } catch (error) {
    console.error('Error creating shipping label:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'Failed to create label'],
    };
  }
}

/**
 * Shipping metadata to store with order
 *
 * This should be stored in Medusa order metadata when:
 * 1. Customer selects shipping during checkout
 * 2. Used later to purchase label during fulfillment
 */
export interface ShippingMetadata {
  easypost_shipment_id: string;
  easypost_rate_id: string;
  carrier: string;
  service: string;
  rate_amount: number;
  estimated_delivery_days: number | null;
}

/**
 * Fulfillment data after label purchase
 *
 * Store this in Medusa fulfillment record
 */
export interface FulfillmentData {
  tracking_code: string;
  tracking_url: string;
  label_url: string;
  carrier: string;
  service: string;
  shipped_at: string;
}

/**
 * Format fulfillment data from purchased label
 */
export function formatFulfillmentData(label: PurchasedLabel): FulfillmentData {
  return {
    tracking_code: label.trackingCode,
    tracking_url: label.trackingUrl,
    label_url: label.labelUrl,
    carrier: label.carrier,
    service: label.service,
    shipped_at: new Date().toISOString(),
  };
}

/**
 * Format shipping metadata from rate selection
 */
export function formatShippingMetadata(
  shipmentId: string,
  rate: {
    id: string;
    carrier: string;
    service: string;
    rate: number;
    estimatedDays: number | null;
  }
): ShippingMetadata {
  return {
    easypost_shipment_id: shipmentId,
    easypost_rate_id: rate.id,
    carrier: rate.carrier,
    service: rate.service,
    rate_amount: rate.rate,
    estimated_delivery_days: rate.estimatedDays,
  };
}
