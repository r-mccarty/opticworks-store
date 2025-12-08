'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
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
  /** Debounce delay in milliseconds (default: 500ms) */
  debounceMs?: number;
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
  debounceMs = 500,
}: UseShippingRatesOptions): UseShippingRatesReturn {
  const [rates, setRates] = useState<ShippingRateResponse[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRateResponse | null>(null);
  const [shipmentId, setShipmentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDigitalOnly, setIsDigitalOnly] = useState(false);
  const [freeShippingEligible, setFreeShippingEligible] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(200);

  // Track the current request to cancel stale requests
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchRates = useCallback(async () => {
    // Validate address has required fields
    if (!address || !address.line1 || !address.city || !address.state || !address.postal_code) {
      return;
    }

    // Validate items
    if (!items || items.length === 0) {
      return;
    }

    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

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
        signal: abortControllerRef.current.signal,
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

      // Auto-select cheapest rate (handled in separate useEffect to avoid dependency loop)

    } catch (err) {
      // Ignore abort errors - they're expected when debouncing
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching shipping rates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping rates');
      setRates([]);
      setShipmentId('');
    } finally {
      setIsLoading(false);
    }
  }, [address, items, subtotal]);

  // Debounced version of fetchRates to prevent rapid-fire requests
  const debouncedFetchRates = useDebouncedCallback(
    fetchRates,
    debounceMs,
    { leading: false, trailing: true }
  );

  // Fetch rates when address or items change (debounced to prevent rapid requests)
  useEffect(() => {
    if (enabled && address && items.length > 0) {
      debouncedFetchRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, address?.line1, address?.city, address?.state, address?.postal_code, items.length, subtotal, debouncedFetchRates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedFetchRates.cancel();
    };
  }, [debouncedFetchRates]);

  // Auto-select cheapest rate when rates load
  // Only runs when rates change, not when selectedRate changes (avoids loop)
  useEffect(() => {
    if (rates.length > 0) {
      setSelectedRate(prevSelected => {
        // If no rate selected, pick cheapest
        if (!prevSelected) {
          return rates.reduce((a, b) => a.rate < b.rate ? a : b);
        }
        // If selected rate is no longer valid, pick cheapest
        const stillValid = rates.some(r => r.id === prevSelected.id);
        if (!stillValid) {
          return rates.reduce((a, b) => a.rate < b.rate ? a : b);
        }
        // Keep current selection
        return prevSelected;
      });
    }
  }, [rates]);

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
