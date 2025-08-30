'use client';

import { useEffect, useState } from 'react';
import { AddressElement } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface CustomerAddress {
  name: string;
  email: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

interface AddressFormProps {
  onAddressChange: (address: CustomerAddress) => void;
  onValidityChange: (isValid: boolean) => void;
  initialValues?: Partial<CustomerAddress>;
}

export default function AddressForm({ onAddressChange, onValidityChange, initialValues }: AddressFormProps) {
  const [email, setEmail] = useState(initialValues?.email || '');
  const [addressData, setAddressData] = useState({
    name: initialValues?.name || '',
    line1: initialValues?.line1 || '',
    line2: initialValues?.line2 || '',
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    postal_code: initialValues?.postal_code || '',
    country: initialValues?.country || 'US'
  });
  
  // Combine email and address data (name will come from Stripe AddressElement)
  useEffect(() => {
    const combinedData = {
      email,
      ...addressData
    };
    onAddressChange(combinedData);
  }, [email, addressData, onAddressChange]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAddressChange = (event: any) => {
    const isAddressValid = event.complete;
    const isEmailValid = email.trim() !== '';
    onValidityChange(isAddressValid && isEmailValid);

    if (event.complete && event.value) {
      const { name, address } = event.value;
      setAddressData({
        name: name || '',
        line1: address.line1 || '',
        line2: address.line2 || '',
        city: address.city || '',
        state: address.state || '',
        postal_code: address.postal_code || '',
        country: address.country || 'US'
      });
    }
  };

  // Handle email changes and validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    
    // Validate overall form whenever email changes
    const isEmailValid = value.trim() !== '';
    const isAddressValid = addressData.name.trim() !== '' && addressData.line1.trim() !== '' && addressData.city.trim() !== '';
    onValidityChange(isEmailValid && isAddressValid);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer & Shipping Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customer-email">Email *</Label>
          <Input 
            id="customer-email" 
            type="email" 
            placeholder="your@email.com" 
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label>Shipping Address *</Label>
          <div className="border rounded-md p-3">
            <AddressElement
              key={JSON.stringify(initialValues)}
              options={{
                mode: 'shipping',
                allowedCountries: ['US'], // Restrict to US for now
                fields: {
                  phone: 'never', // Don't show phone field
                },
                autocomplete: {
                  mode: 'automatic'
                },
                defaultValues: {
                  name: initialValues?.name || '',
                  address: {
                    line1: initialValues?.line1 || '',
                    line2: initialValues?.line2 || '',
                    city: initialValues?.city || '',
                    state: initialValues?.state || '',
                    postal_code: initialValues?.postal_code || '',
                    country: initialValues?.country || 'US'
                  }
                }
              }}
              onChange={handleAddressChange}
            />
          </div>
          <p className="text-sm text-gray-600">
            Enter your full name and address - we&apos;ll help you find and validate it automatically as you type.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}