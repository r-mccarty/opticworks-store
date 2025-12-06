'use client';

import { useState, useEffect, useCallback } from 'react';
import type { ShippingRateResponse, ShippingRatesApiResponse } from '@/app/api/shipping/rates/route';

export interface ShippingAddress {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

export interface CartItem {
  sku: string;
  quantity: number;
}

interface UseShippingRatesOptions {
  address: ShippingAddress | null;
  items: CartItem[];
  subtotal: number;
  enabled?: boolean;
}

interface UseShippingRatesReturn {
  rates: ShippingRateResponse[];
  selectedRate: ShippingRateResponse | null;
  shipmentId: string;
  isLoading: boolean;
  error: string | null;
  isDigitalOnly: boolean;
  freeShippingEligible: boolean;
  freeShippingThreshold: number;
  selectRate: (rate: ShippingRateResponse) => void;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage shipping rates
 *
 * @example
 * ```tsx
 * const {
 *   rates,
 *   selectedRate,
 *   isLoading,
 *   selectRate,
 * } = useShippingRates({
 *   address: customerAddress,
 *   items: cartItems,
 *   subtotal: 299.99,
 * });
 * ```
 */
export function useShippingRates({
  address,
  items,
  subtotal,
  enabled = true,
}: UseShippingRatesOptions): UseShippingRatesReturn {
  const [rates, setRates] = useState<ShippingRateResponse[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRateResponse | null>(null);
  const [shipmentId, setShipmentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDigitalOnly, setIsDigitalOnly] = useState(false);
  const [freeShippingEligible, setFreeShippingEligible] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(200);

  const fetchRates = useCallback(async () => {
    // Validate address has required fields
    if (!address || !address.line1 || !address.city || !address.state || !address.postal_code) {
      return;
    }

    // Validate items
    if (!items || items.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          items,
          subtotal,
        }),
      });

      const data: ShippingRatesApiResponse = await response.json();

      if (!data.success) {
        setError(data.errors?.[0] || 'Failed to fetch shipping rates');
        setRates([]);
        setShipmentId('');
        return;
      }

      setRates(data.rates);
      setShipmentId(data.shipmentId);
      setIsDigitalOnly(data.isDigitalOnly);
      setFreeShippingEligible(data.freeShippingEligible);
      setFreeShippingThreshold(data.freeShippingThreshold);

      // Auto-select cheapest rate if none selected
      if (data.rates.length > 0 && !selectedRate) {
        const cheapest = data.rates.reduce((a, b) => a.rate < b.rate ? a : b);
        setSelectedRate(cheapest);
      }

    } catch (err) {
      console.error('Error fetching shipping rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping rates');
      setRates([]);
      setShipmentId('');
    } finally {
      setIsLoading(false);
    }
  }, [address, items, subtotal, selectedRate]);

  // Fetch rates when address or items change
  // We deliberately use individual address fields for better debouncing
  useEffect(() => {
    if (enabled && address && items.length > 0) {
      fetchRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, address?.line1, address?.city, address?.state, address?.postal_code, items.length, subtotal, fetchRates]);

  // Reset selected rate when rates change
  useEffect(() => {
    if (rates.length > 0 && selectedRate) {
      // Check if selected rate is still valid
      const stillValid = rates.some(r => r.id === selectedRate.id);
      if (!stillValid) {
        // Select cheapest rate
        const cheapest = rates.reduce((a, b) => a.rate < b.rate ? a : b);
        setSelectedRate(cheapest);
      }
    }
  }, [rates, selectedRate]);

  const selectRate = useCallback((rate: ShippingRateResponse) => {
    setSelectedRate(rate);
  }, []);

  return {
    rates,
    selectedRate,
    shipmentId,
    isLoading,
    error,
    isDigitalOnly,
    freeShippingEligible,
    freeShippingThreshold,
    selectRate,
    refetch: fetchRates,
  };
}

export type { ShippingRateResponse };
