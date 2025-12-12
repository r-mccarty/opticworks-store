'use client';

import { AddressElement } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AddressFormProps {
  onComplete: (isComplete: boolean) => void;
}

export default function AddressForm({ onComplete }: AddressFormProps) {
  
  const handleAddressChange = (event: {complete: boolean}) => {
    // Notify parent component when address is complete
    onComplete(event.complete);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="border border-border rounded-md bg-background p-3">
            <AddressElement 
              options={{
                mode: 'shipping',
                allowedCountries: ['US'],
                fields: {
                  phone: 'never',
                },
                autocomplete: {
                  mode: 'automatic'
                },
              }}
              onChange={handleAddressChange}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Enter your shipping address. Shipping rates and tax will be calculated automatically.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
