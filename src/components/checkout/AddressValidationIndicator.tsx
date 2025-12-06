'use client';

import { Check, AlertTriangle, X, Loader2 } from 'lucide-react';
import type { AddressValidationStatus } from '@/hooks/useAddressValidation';

interface AddressValidationIndicatorProps {
  status: AddressValidationStatus;
  className?: string;
  showLabel?: boolean;
}

/**
 * Visual indicator for address validation status
 */
export function AddressValidationIndicator({
  status,
  className = '',
  showLabel = false,
}: AddressValidationIndicatorProps) {
  const config = {
    idle: {
      icon: null,
      label: '',
      className: '',
    },
    validating: {
      icon: <Loader2 className="h-4 w-4 animate-spin" />,
      label: 'Validating...',
      className: 'text-gray-400',
    },
    valid: {
      icon: <Check className="h-4 w-4" />,
      label: 'Address verified',
      className: 'text-green-500',
    },
    warning: {
      icon: <AlertTriangle className="h-4 w-4" />,
      label: 'Address may have issues',
      className: 'text-amber-500',
    },
    invalid: {
      icon: <X className="h-4 w-4" />,
      label: 'Invalid address',
      className: 'text-red-500',
    },
  };

  const currentConfig = config[status];

  if (!currentConfig.icon) {
    return null;
  }

  return (
    <div className={`flex items-center gap-1.5 ${currentConfig.className} ${className}`}>
      {currentConfig.icon}
      {showLabel && (
        <span className="text-sm">{currentConfig.label}</span>
      )}
    </div>
  );
}

/**
 * Inline validation message
 */
export function AddressValidationMessage({
  status,
  errors,
}: {
  status: AddressValidationStatus;
  errors: string[];
}) {
  if (status === 'valid') {
    return (
      <p className="mt-1.5 flex items-center gap-1 text-sm text-green-600">
        <Check className="h-4 w-4" />
        Address verified
      </p>
    );
  }

  if (status === 'warning' && errors.length > 0) {
    return (
      <div className="mt-1.5 rounded-md bg-amber-50 p-2 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Please verify your address:</p>
            <ul className="mt-1 list-inside list-disc">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'invalid' && errors.length > 0) {
    return (
      <div className="mt-1.5 rounded-md bg-red-50 p-2 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
        <div className="flex items-start gap-2">
          <X className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div>
            <p className="font-medium">Address could not be verified:</p>
            <ul className="mt-1 list-inside list-disc">
              {errors.map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default AddressValidationIndicator;
