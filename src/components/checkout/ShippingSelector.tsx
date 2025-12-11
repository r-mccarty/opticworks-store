'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Truck, Package, Zap, Check } from 'lucide-react';
import type { ShippingRate } from '@/hooks/useMedusaShipping';
import { cn } from '@/lib/utils';

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
 * Get carrier icon with design system colors
 */
function CarrierIcon({ carrier }: { carrier: string }) {
  switch (carrier.toUpperCase()) {
    case 'FEDEX':
      return <Zap className="h-5 w-5 text-info" />;
    case 'UPS':
      return <Package className="h-5 w-5 text-warning" />;
    case 'USPS':
    default:
      return <Truck className="h-5 w-5 text-primary" />;
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
 * Uses OpticWorks design tokens - dark mode only
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
            <Package className="h-5 w-5 text-primary" />
            Delivery
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-success">
            <Check className="h-5 w-5" />
            <span className="font-medium">Digital delivery - No shipping required</span>
          </div>
          <p className="mt-2 text-sm text-foreground-muted">
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
          <Truck className="h-5 w-5 text-primary" />
          Shipping Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Free shipping banner */}
        {freeShippingEligible && (
          <div className="flex items-center gap-2 rounded-xl bg-success-muted border border-success/30 p-4 text-success">
            <Check className="h-5 w-5 flex-shrink-0" />
            <div>
              <span className="font-medium">Free shipping applied!</span>
              <span className="ml-1 text-success/80">Your order qualifies for free standard shipping.</span>
            </div>
          </div>
        )}
        {!freeShippingEligible && subtotal > 0 && (
          <div className="flex items-center gap-2 rounded-xl bg-info-muted border border-info/30 p-4 text-info">
            <Truck className="h-5 w-5 flex-shrink-0" />
            <span>
              Add <span className="font-semibold">${(freeShippingThreshold - subtotal).toFixed(2)}</span> more to qualify for free shipping.
            </span>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center py-8" data-testid="shipping-rates-loading">
            <Loader2 className="h-6 w-6 animate-spin text-foreground-muted" />
            <span className="ml-3 text-foreground-muted">Calculating shipping rates...</span>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div
            className="rounded-xl bg-error-muted border border-error/30 p-4"
            data-testid="shipping-rates-error"
          >
            <p className="font-medium text-error">Unable to calculate shipping</p>
            <p className="mt-1 text-sm text-error/80">{error}</p>
          </div>
        )}

        {/* No rates available */}
        {!isLoading && !error && rates.length === 0 && (
          <div className="py-6 text-center text-foreground-muted">
            <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Enter your shipping address to see available options.</p>
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
                  className={cn(
                    // Base styles
                    "relative flex cursor-pointer rounded-xl border-2 p-4 transition-all duration-200",
                    // Selected vs unselected
                    isSelected
                      ? "border-primary bg-primary-muted shadow-glow-primary"
                      : "border-border hover:border-border-hover hover:bg-background-subtle"
                  )}
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

                  <div className="flex w-full items-center gap-4">
                    {/* Carrier icon */}
                    <div className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                      isSelected ? "bg-primary/20" : "bg-background-muted"
                    )}>
                      <CarrierIcon carrier={rate.carrier} />
                    </div>

                    {/* Rate details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground">
                          {rate.name}
                        </span>
                        {/* Badges */}
                        {rate.badges?.map((badge) => (
                          <span
                            key={badge}
                            className={cn(
                              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                              badge === 'Fastest'
                                ? "bg-warning-muted text-warning border border-warning/30"
                                : "bg-success-muted text-success border border-success/30"
                            )}
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                      <p className="mt-1 text-sm text-foreground-muted">
                        {rate.estimatedDelivery}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="flex-shrink-0 text-right">
                      <span
                        className={cn(
                          "text-lg font-semibold",
                          rate.amount === 0
                            ? "text-success"
                            : "text-foreground"
                        )}
                      >
                        {formatPrice(rate.amount, rate.currency)}
                      </span>
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
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
