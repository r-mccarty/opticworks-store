'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import {
  getShippingOptions,
  addShippingMethod,
  updateCart,
  type MedusaShippingOption,
  type MedusaAddress,
} from '@/lib/api/medusa';

/**
 * Address format for shipping (Stripe AddressElement format)
 */
export interface ShippingAddress {
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

/**
 * Shipping rate displayed in UI (normalized from Medusa format)
 */
export interface ShippingRate {
  id: string;
  name: string;
  carrier: string;
  service: string;
  /** Price in dollars (major units) */
  amount: number;
  currency: string;
  estimatedDays: number | null;
  estimatedDelivery: string;
  badges?: string[];
}

interface UseMedusaShippingOptions {
  cartId: string | null;
  address: ShippingAddress | null;
  enabled?: boolean;
  debounceMs?: number;
}

interface UseMedusaShippingReturn {
  rates: ShippingRate[];
  selectedRate: ShippingRate | null;
  isLoading: boolean;
  error: string | null;
  isDigitalOnly: boolean;
  selectRate: (rate: ShippingRate) => Promise<void>;
  refetch: () => Promise<void>;
}

/**
 * Convert Stripe address format to Medusa format
 */
function toMedusaAddress(address: ShippingAddress): MedusaAddress {
  const nameParts = (address.name || 'Customer').split(' ');
  return {
    first_name: nameParts[0] || 'Customer',
    last_name: nameParts.slice(1).join(' ') || '',
    address_1: address.line1,
    address_2: address.line2 || '',
    city: address.city,
    province: address.state,
    postal_code: address.postal_code,
    country_code: (address.country || 'US').toLowerCase(),
  };
}

/**
 * Parse carrier and service from shipping option ID
 * Backend EasyPost provider uses IDs like "usps-ground", "fedex-2day"
 */
function parseCarrierInfo(optionId: string, optionName: string): { carrier: string; service: string } {
  const id = optionId.toLowerCase();

  if (id.includes('usps')) {
    return { carrier: 'USPS', service: optionName };
  }
  if (id.includes('fedex')) {
    return { carrier: 'FedEx', service: optionName };
  }
  if (id.includes('ups')) {
    return { carrier: 'UPS', service: optionName };
  }

  // Fallback: extract from option name
  const name = optionName.toUpperCase();
  if (name.includes('USPS')) return { carrier: 'USPS', service: optionName };
  if (name.includes('FEDEX')) return { carrier: 'FedEx', service: optionName };
  if (name.includes('UPS')) return { carrier: 'UPS', service: optionName };

  return { carrier: 'Standard', service: optionName };
}

/**
 * Estimate delivery days based on service name
 */
function estimateDeliveryDays(serviceName: string): number | null {
  const name = serviceName.toLowerCase();

  if (name.includes('overnight') || name.includes('express')) return 1;
  if (name.includes('2day') || name.includes('2-day') || name.includes('priority')) return 2;
  if (name.includes('3day') || name.includes('3-day')) return 3;
  if (name.includes('ground') || name.includes('standard')) return 5;

  return null;
}

/**
 * Format estimated delivery string
 */
function formatEstimatedDelivery(days: number | null): string {
  if (days === null) return 'Varies';
  if (days === 1) return '1-2 business days';
  if (days === 2) return '2-3 business days';
  return `${days}-${days + 2} business days`;
}

/**
 * Transform Medusa shipping option to normalized ShippingRate format
 */
function transformShippingOption(option: MedusaShippingOption): ShippingRate {
  const { carrier, service } = parseCarrierInfo(
    (option.data?.id as string) || option.id,
    option.name
  );
  const estimatedDays = estimateDeliveryDays(option.name);

  return {
    id: option.id,
    name: option.name,
    carrier,
    service,
    // Medusa returns amount in dollars (not cents) for shipping options
    amount: option.amount,
    currency: 'USD',
    estimatedDays,
    estimatedDelivery: formatEstimatedDelivery(estimatedDays),
  };
}

/**
 * Assign badges to rates (Best Value, Fastest)
 */
function assignBadges(rates: ShippingRate[]): ShippingRate[] {
  if (rates.length === 0) return rates;

  // Find cheapest
  const cheapestIdx = rates.reduce((minIdx, rate, idx, arr) =>
    rate.amount < arr[minIdx].amount ? idx : minIdx, 0);

  // Find fastest (with delivery days)
  const withDays = rates.map((r, i) => ({ rate: r, idx: i }))
    .filter(({ rate }) => rate.estimatedDays !== null);

  const fastestIdx = withDays.length > 0
    ? withDays.reduce((minIdx, { rate, idx }, _, arr) =>
        (rate.estimatedDays || 99) < (arr[minIdx.idx]?.rate.estimatedDays || 99) ? { rate, idx } : minIdx,
        withDays[0]).idx
    : -1;

  return rates.map((rate, idx) => ({
    ...rate,
    badges: [
      ...(idx === cheapestIdx ? ['Best Value'] : []),
      ...(idx === fastestIdx && fastestIdx !== cheapestIdx ? ['Fastest'] : []),
    ].filter(b => b.length > 0) || undefined,
  }));
}

/**
 * Hook to fetch and manage shipping rates via Medusa's fulfillment provider.
 *
 * The backend EasyPost provider calculates real-time shipping rates
 * when shipping options are requested with a cart that has a shipping address.
 *
 * @example
 * ```tsx
 * const {
 *   rates,
 *   selectedRate,
 *   isLoading,
 *   selectRate,
 * } = useMedusaShipping({
 *   cartId: 'cart_xxx',
 *   address: customerAddress,
 * });
 * ```
 */
export function useMedusaShipping({
  cartId,
  address,
  enabled = true,
  debounceMs = 500,
}: UseMedusaShippingOptions): UseMedusaShippingReturn {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [selectedRate, setSelectedRate] = useState<ShippingRate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDigitalOnly] = useState(false); // TODO: Detect from cart items

  // Track current request to cancel stale ones
  const abortControllerRef = useRef<AbortController | null>(null);
  // Track if we've updated the cart address
  const addressUpdatedRef = useRef(false);

  const fetchRates = useCallback(async () => {
    // Validate required inputs
    if (!cartId) {
      console.log('[useMedusaShipping] No cart ID, skipping fetch');
      return;
    }

    if (!address || !address.line1 || !address.city || !address.state || !address.postal_code) {
      console.log('[useMedusaShipping] Address incomplete, skipping fetch');
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
      // First, update cart with shipping address (required for rate calculation)
      // Only do this if the address has changed
      if (!addressUpdatedRef.current) {
        console.log('[useMedusaShipping] Updating cart with shipping address...');
        const medusaAddress = toMedusaAddress(address);
        await updateCart(cartId, { shipping_address: medusaAddress });
        addressUpdatedRef.current = true;
        console.log('[useMedusaShipping] Cart address updated');
      }

      // Fetch shipping options from Medusa
      // The backend EasyPost provider will calculate rates dynamically
      console.log('[useMedusaShipping] Fetching shipping options for cart:', cartId);
      const options = await getShippingOptions(cartId);
      console.log('[useMedusaShipping] Received', options.length, 'shipping options');

      // Transform to UI format
      const transformedRates = options.map(transformShippingOption);

      // Sort by price (cheapest first)
      transformedRates.sort((a, b) => a.amount - b.amount);

      // Assign badges
      const ratesWithBadges = assignBadges(transformedRates);

      setRates(ratesWithBadges);

      // Auto-select cheapest rate if none selected
      // Note: This only sets the UI state - the user must explicitly click
      // to trigger the actual addShippingMethod API call. This is intentional
      // to avoid unexpected API calls during rate loading.
      if (ratesWithBadges.length > 0 && !selectedRate) {
        const cheapest = ratesWithBadges[0];
        setSelectedRate(cheapest);
        console.log('[useMedusaShipping] Auto-selected cheapest rate (UI only):', cheapest.name);
      }

    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('[useMedusaShipping] Error fetching shipping options:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shipping rates');
      setRates([]);
    } finally {
      setIsLoading(false);
    }
  }, [cartId, address, selectedRate]);

  // Debounced fetch to prevent rapid requests during address entry
  const debouncedFetchRates = useDebouncedCallback(
    fetchRates,
    debounceMs,
    { leading: false, trailing: true }
  );

  // Reset address flag when address changes
  useEffect(() => {
    addressUpdatedRef.current = false;
  }, [address?.line1, address?.city, address?.state, address?.postal_code]);

  // Fetch rates when inputs change
  useEffect(() => {
    if (enabled && cartId && address) {
      debouncedFetchRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    cartId,
    address?.line1,
    address?.city,
    address?.state,
    address?.postal_code,
    debouncedFetchRates,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      debouncedFetchRates.cancel();
    };
  }, [debouncedFetchRates]);

  /**
   * Select a shipping rate and add it to the cart via Medusa API.
   * This updates the cart total to include shipping.
   */
  const selectRate = useCallback(async (rate: ShippingRate) => {
    if (!cartId) {
      console.error('[useMedusaShipping] Cannot select rate: no cart ID');
      return;
    }

    console.log('[useMedusaShipping] Selecting shipping rate:', rate.name, rate.amount);
    setSelectedRate(rate);

    try {
      // Add shipping method to cart via Medusa API
      // This updates the cart total to include shipping
      await addShippingMethod(cartId, rate.id);
      console.log('[useMedusaShipping] Shipping method added to cart');
    } catch (err) {
      console.error('[useMedusaShipping] Error adding shipping method:', err);
      // Don't clear selection - let checkout continue
      // The shipping cost is displayed, user can retry
    }
  }, [cartId]);

  return {
    rates,
    selectedRate,
    isLoading,
    error,
    isDigitalOnly,
    selectRate,
    refetch: fetchRates,
  };
}
