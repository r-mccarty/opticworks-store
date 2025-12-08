'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Package, Zap, Check } from 'lucide-react';
import type { ShippingRate } from '@/hooks/useMedusaShipping';

interface ShippingSelectorProps {
  rates: ShippingRate[];
  selectedRate: ShippingRate | null;
  onSelectRate: (rate: ShippingRate) => void;
  isLoading: boolean;
  error: string | null;
  isDigitalOnly: boolean;
  /** Subtotal for free shipping calculation */
  subtotal?: number;
  /** Free shipping threshold in dollars (default: 200) */
  freeShippingThreshold?: number;
}

/**
 * Get carrier icon
 */
function CarrierIcon({ carrier }: { carrier: string }) {
  // Could use actual carrier logos here
  switch (carrier.toUpperCase()) {
    case 'FEDEX':
      return <Zap className="h-5 w-5 text-purple-600" />;
    case 'UPS':
      return <Package className="h-5 w-5 text-amber-700" />;
    case 'USPS':
    default:
      return <Truck className="h-5 w-5 text-blue-600" />;
  }
}

/**
 * Format price for display
 */
function formatPrice(amount: number, currency: string = 'USD'): string {
  if (amount === 0) {
    return 'FREE';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Shipping option selector component
 */
export function ShippingSelector({
  rates,
  selectedRate,
  onSelectRate,
  isLoading,
  error,
  isDigitalOnly,
  subtotal = 0,
  freeShippingThreshold = 200,
}: ShippingSelectorProps) {
  const freeShippingEligible = subtotal >= freeShippingThreshold;
  // Digital-only orders don't need shipping
  if (isDigitalOnly) {
    return (
      <Card data-testid="shipping-selector-digital">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span>Digital delivery - No shipping required</span>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            You&apos;ll receive download links via email after purchase.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="shipping-selector">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free shipping banner */}
        {freeShippingEligible && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
            <span className="font-medium">Free shipping applied!</span> Your order qualifies for free standard shipping.
          </div>
        )}
        {!freeShippingEligible && subtotal > 0 && (
          <div className="rounded-md bg-blue-50 p-3 text-sm text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
            Add ${(freeShippingThreshold - subtotal).toFixed(2)} more to qualify for free shipping.
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8" data-testid="shipping-rates-loading">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Calculating shipping rates...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400" data-testid="shipping-rates-error">
            <p className="font-medium">Unable to calculate shipping</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* No rates available */}
        {!isLoading && !error && rates.length === 0 && (
          <div className="py-4 text-center text-gray-500">
            Enter your shipping address to see available options.
          </div>
        )}

        {/* Shipping options */}
        {!isLoading && rates.length > 0 && (
          <div className="space-y-3" data-testid="shipping-rates-list">
            {rates.map((rate) => {
              const isSelected = selectedRate?.id === rate.id;

              return (
                <label
                  key={rate.id}
                  data-testid={`shipping-rate-${rate.id}`}
                  className={`
                    relative flex cursor-pointer rounded-lg border p-4 transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 dark:bg-blue-900/20'
                      : 'border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="shipping-rate"
                    value={rate.id}
                    checked={isSelected}
                    onChange={() => onSelectRate(rate)}
                    className="sr-only"
                    data-testid={`shipping-radio-${rate.id}`}
                  />

                  <div className="flex w-full items-start gap-4">
                    {/* Carrier icon */}
                    <div className="flex-shrink-0 pt-0.5">
                      <CarrierIcon carrier={rate.carrier} />
                    </div>

                    {/* Rate details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {rate.name}
                        </span>
                        {/* Badges */}
                        {rate.badges?.map((badge) => (
                          <span
                            key={badge}
                            className={`
                              inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                              ${badge === 'Fastest'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              }
                            `}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {rate.estimatedDelivery}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`
                          text-lg font-semibold
                          ${rate.amount === 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-gray-900 dark:text-gray-100'
                          }
                        `}
                      >
                        {formatPrice(rate.amount, rate.currency)}
                      </span>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute right-4 top-4">
                        <Check className="h-5 w-5 text-blue-500" />
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ShippingSelector;
