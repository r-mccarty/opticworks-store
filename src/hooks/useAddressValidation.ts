'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AddressInput, ValidatedAddress, AddressValidationResponse } from '@/lib/api/easypost';

export type AddressValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid' | 'warning';

export interface AddressValidationState {
  status: AddressValidationStatus;
  validatedAddress: ValidatedAddress | null;
  suggestions: ValidatedAddress[];
  errors: string[];
  isDeliverable: boolean;
}

interface UseAddressValidationOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Auto-validate when address changes */
  autoValidate?: boolean;
}

interface UseAddressValidationReturn extends AddressValidationState {
  /** Validate an address */
  validate: (address: AddressInput) => Promise<void>;
  /** Clear validation state */
  clear: () => void;
  /** Accept a suggested address */
  acceptSuggestion: (suggestion: ValidatedAddress) => void;
}

const initialState: AddressValidationState = {
  status: 'idle',
  validatedAddress: null,
  suggestions: [],
  errors: [],
  isDeliverable: false,
};

/**
 * Hook to manage address validation state
 *
 * @example
 * ```tsx
 * const {
 *   status,
 *   validatedAddress,
 *   suggestions,
 *   errors,
 *   validate,
 *   acceptSuggestion,
 * } = useAddressValidation();
 *
 * // Validate on blur
 * const handleBlur = () => {
 *   validate({
 *     street1: addressLine1,
 *     city,
 *     state,
 *     zip: postalCode,
 *   });
 * };
 * ```
 */
export function useAddressValidation(
  options: UseAddressValidationOptions = {}
): UseAddressValidationReturn {
  const { debounceMs = 500 } = options;

  const [state, setState] = useState<AddressValidationState>(initialState);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const validate = useCallback(async (address: AddressInput) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Validate required fields
    if (!address.street1 || !address.city || !address.state || !address.zip) {
      setState({
        ...initialState,
        status: 'idle',
      });
      return;
    }

    // Set validating state immediately
    setState((prev) => ({
      ...prev,
      status: 'validating',
    }));

    // Debounce the actual API call
    return new Promise<void>((resolve) => {
      debounceRef.current = setTimeout(async () => {
        try {
          abortControllerRef.current = new AbortController();

          const response = await fetch('/api/easypost/validate-address', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(address),
            signal: abortControllerRef.current.signal,
          });

          const data: AddressValidationResponse = await response.json();

          if (data.success && data.address) {
            const isDeliverable = data.address.verifications.delivery.success;
            const hasErrors = data.address.verifications.delivery.errors.length > 0;

            setState({
              status: isDeliverable ? 'valid' : hasErrors ? 'warning' : 'valid',
              validatedAddress: data.address,
              suggestions: data.suggestions || [],
              errors: data.address.verifications.delivery.errors.map((e) => e.message),
              isDeliverable,
            });
          } else {
            setState({
              status: 'invalid',
              validatedAddress: null,
              suggestions: data.suggestions || [],
              errors: data.errors || ['Address validation failed'],
              isDeliverable: false,
            });
          }

          resolve();

        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name === 'AbortError') {
            resolve();
            return;
          }

          console.error('Address validation error:', error);
          setState({
            status: 'invalid',
            validatedAddress: null,
            suggestions: [],
            errors: [error instanceof Error ? error.message : 'Validation failed'],
            isDeliverable: false,
          });
          resolve();
        }
      }, debounceMs);
    });
  }, [debounceMs]);

  const clear = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState(initialState);
  }, []);

  const acceptSuggestion = useCallback((suggestion: ValidatedAddress) => {
    setState({
      status: 'valid',
      validatedAddress: suggestion,
      suggestions: [],
      errors: [],
      isDeliverable: true,
    });
  }, []);

  return {
    ...state,
    validate,
    clear,
    acceptSuggestion,
  };
}

export type { AddressInput, ValidatedAddress };
