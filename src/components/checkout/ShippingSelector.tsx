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
      return <Zap className="h-5 w-5 text-muted-foreground" />;
    case 'UPS':
      return <Package className="h-5 w-5 text-muted-foreground" />;
    case 'USPS':
    default:
      return <Truck className="h-5 w-5 text-muted-foreground" />;
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
          <div className="flex items-center gap-2 text-secondary">
            <Check className="h-5 w-5" />
            <span>Digital delivery - No shipping required</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
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
          <div className="rounded-md border border-secondary/30 bg-secondary/10 p-3 text-sm text-secondary">
            <span className="font-medium">Free shipping applied!</span> Your order qualifies for free standard shipping.
          </div>
        )}
        {!freeShippingEligible && subtotal > 0 && (
          <div className="rounded-md border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
            Add ${(freeShippingThreshold - subtotal).toFixed(2)} more to qualify for free shipping.
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8" data-testid="shipping-rates-loading">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Calculating shipping rates...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive" data-testid="shipping-rates-error">
            <p className="font-medium">Unable to calculate shipping</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {/* No rates available */}
        {!isLoading && !error && rates.length === 0 && (
          <div className="py-4 text-center text-muted-foreground">
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
                      ? 'border-ring bg-muted/60 ring-1 ring-ring/50'
                      : 'border-border hover:border-muted-foreground/40'
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
                        <span className="font-medium text-foreground">
                          {rate.name}
                        </span>
                        {/* Badges */}
                        {rate.badges?.map((badge) => (
                          <span
                            key={badge}
                            className={`
                              inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium
                              ${badge === 'Fastest'
                                ? 'bg-primary/15 text-primary'
                                : 'bg-secondary/15 text-secondary'
                              }
                            `}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {rate.estimatedDelivery}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={`
                          text-lg font-semibold
                          ${rate.amount === 0
                            ? 'text-secondary'
                            : 'text-foreground'
                          }
                        `}
                      >
                        {formatPrice(rate.amount, rate.currency)}
                      </span>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="absolute right-4 top-4">
                        <Check className="h-5 w-5 text-ring" />
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
