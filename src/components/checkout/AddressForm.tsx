'use client';

import { useEffect, useState } from 'react';
import { AddressElement, useElements } from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import type { AddressInput, ValidatedAddress } from '@/lib/api/easypost';

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

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'suggestions';

export default function AddressForm({ onAddressChange, onValidityChange, initialValues }: AddressFormProps) {
  const elements = useElements();
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
  
  // Address validation state
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle');
  const [validationMessage, setValidationMessage] = useState<string>('');
  const [addressSuggestions, setAddressSuggestions] = useState<ValidatedAddress[]>([]);
  const [validationTimeout, setValidationTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Address validation function
  const validateAddress = async (address: AddressInput) => {
    if (!address.street1 || !address.city || !address.state || !address.zip) {
      return;
    }

    setValidationStatus('validating');
    setValidationMessage('Validating address...');

    try {
      const response = await fetch('/api/easypost/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(address),
      });

      const result = await response.json();

      if (result.success && result.address) {
        setValidationStatus('valid');
        setValidationMessage('Address verified ✓');
        setAddressSuggestions([]);
      } else {
        // Try getting suggestions if validation failed
        const suggestionResponse = await fetch('/api/easypost/suggest-address', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(address),
        });

        const suggestionResult = await suggestionResponse.json();
        
        if (suggestionResult.success && suggestionResult.suggestions.length > 0) {
          setValidationStatus('suggestions');
          setValidationMessage('We found some suggested corrections:');
          setAddressSuggestions(suggestionResult.suggestions);
        } else {
          setValidationStatus('invalid');
          setValidationMessage('Unable to verify this address. Please double-check the details.');
          setAddressSuggestions([]);
        }
      }
    } catch (error) {
      console.error('Address validation error:', error);
      setValidationStatus('invalid');
      setValidationMessage('Address validation failed. Please verify your address manually.');
      setAddressSuggestions([]);
    }
  };

  // Handle address suggestion selection
  const handleSuggestionSelect = (suggestion: ValidatedAddress) => {
    const updatedAddress = {
      name: suggestion.name || '',
      line1: suggestion.street1,
      line2: suggestion.street2 || '',
      city: suggestion.city,
      state: suggestion.state,
      postal_code: suggestion.zip,
      country: suggestion.country || 'US'
    };
    
    setAddressData(updatedAddress);
    setValidationStatus('valid');
    setValidationMessage('Address updated and verified ✓');
    setAddressSuggestions([]);
  };
  
  // Combine email and address data (name will come from Stripe AddressElement)
  useEffect(() => {
    const combinedData = {
      email,
      ...addressData
    };
    onAddressChange(combinedData);
  }, [email, addressData, onAddressChange]);

  useEffect(() => {
    if (!elements) return;

    const addressElement = elements.getElement('address');
    if (!addressElement) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAddressChange = (event: any) => {
      const isAddressValid = event.complete;
      const isEmailValid = email.trim() !== '';
      
      // Only set form validity to true if address is both complete and validated
      const isValidated = validationStatus === 'valid';
      onValidityChange(isAddressValid && isEmailValid && (isValidated || validationStatus === 'idle'));
      
      if (event.complete && event.value) {
        // Extract both name and address from Stripe AddressElement
        const { name, address } = event.value;
        const newAddressData = {
          name: name || '',
          line1: address.line1 || '',
          line2: address.line2 || '',
          city: address.city || '',
          state: address.state || '',
          postal_code: address.postal_code || '',
          country: address.country || 'US'
        };
        
        setAddressData(newAddressData);
        
        // Clear previous timeout
        if (validationTimeout) {
          clearTimeout(validationTimeout);
        }
        
        // Debounce address validation
        const timeout = setTimeout(() => {
          const addressInput: AddressInput = {
            street1: newAddressData.line1,
            street2: newAddressData.line2,
            city: newAddressData.city,
            state: newAddressData.state,
            zip: newAddressData.postal_code,
            country: newAddressData.country,
            name: newAddressData.name
          };
          
          validateAddress(addressInput);
        }, 1000); // 1 second debounce
        
        setValidationTimeout(timeout);
      }
    };

    // Use addEventListener for compatibility
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (addressElement as any).on('change', handleAddressChange);
    
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (addressElement as any).off('change', handleAddressChange);
      
      // Clean up validation timeout
      if (validationTimeout) {
        clearTimeout(validationTimeout);
      }
    };
  }, [elements, email, onValidityChange, validationTimeout, validationStatus]);

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
            />
          </div>
          <p className="text-sm text-gray-600">
            Enter your full name and address - we&apos;ll help you find and validate it automatically as you type.
          </p>
          
          {/* Address Validation Status */}
          {validationStatus !== 'idle' && (
            <div className="mt-3">
              <div className="flex items-center space-x-2">
                {validationStatus === 'validating' && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-blue-600">{validationMessage}</span>
                  </>
                )}
                {validationStatus === 'valid' && (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">{validationMessage}</span>
                  </>
                )}
                {validationStatus === 'invalid' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-amber-600">{validationMessage}</span>
                  </>
                )}
                {validationStatus === 'suggestions' && (
                  <>
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-blue-600">{validationMessage}</span>
                  </>
                )}
              </div>
              
              {/* Address Suggestions */}
              {addressSuggestions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {addressSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="border border-blue-200 bg-blue-50 rounded-lg p-3 cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="text-sm">
                          <div className="font-medium">{suggestion.name}</div>
                          <div>{suggestion.street1}</div>
                          {suggestion.street2 && <div>{suggestion.street2}</div>}
                          <div>{suggestion.city}, {suggestion.state} {suggestion.zip}</div>
                          {suggestion.verifications.zip4.success && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              ZIP+4: {suggestion.verifications.zip4.zip4}
                            </Badge>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSuggestionSelect(suggestion);
                          }}
                        >
                          Use This Address
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}