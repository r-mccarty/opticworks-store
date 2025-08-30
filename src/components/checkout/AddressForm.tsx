'use client';

import { useEffect } from 'react';
import { AddressElement, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

interface ShippingAddress {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface AddressFormProps {
  onAddressChange: (address: ShippingAddress) => void;
  onValidityChange: (isValid: boolean) => void;
}

export default function AddressForm({ onAddressChange, onValidityChange }: AddressFormProps) {
  const elements = useElements();

  useEffect(() => {
    if (!elements) return;

    const addressElement = elements.getElement('address');
    if (!addressElement) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleChange = (event: any) => {
      onValidityChange(event.complete);
      
      if (event.complete && event.value) {
        // Convert Stripe address format to your format
        const address = event.value.address;
        onAddressChange({
          line1: address.line1 || '',
          line2: address.line2 || '',
          city: address.city || '',
          state: address.state || '',
          postal_code: address.postal_code || '',
          country: address.country || 'US'
        });
      }
    };

    // Use addEventListener for compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (addressElement as any).on('change', handleChange);
    
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (addressElement as any).off('change', handleChange);
    };
  }, [elements, onAddressChange, onValidityChange]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Address *</Label>
          <div className="border rounded-md p-3">
            <AddressElement 
              options={{
                mode: 'shipping',
                allowedCountries: ['US'], // Restrict to US for now
                autocomplete: {
                  mode: 'automatic'
                }
              }} 
            />
          </div>
          <p className="text-sm text-gray-600">
            Start typing your address - we&apos;ll help you find and validate it.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}