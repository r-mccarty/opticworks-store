// Shared type definitions for checkout flow

export interface CustomerInfo {
  email: string;
  name: string;
}

export interface ShippingAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface CheckoutTotals {
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
}

export interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface PaymentFormProps {
  clientSecret: string;
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  totals: CheckoutTotals;
}

export interface CheckoutWrapperProps {
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  onSuccess: (sessionId: string) => void;
  onError: (error: string) => void;
}

export interface CheckoutSessionResponse {
  clientSecret: string;
  checkoutSessionId: string;
  customerId: string;
  totals: CheckoutTotals;
  sessionDetails: {
    mode: string;
    currency: string;
    customer_email: string;
    return_url: string;
  };
}

export interface AddressValidationResult {
  success: boolean;
  address?: {
    id: string;
    street1: string;
    street2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    name: string;
    residential: boolean;
    verifications: {
      delivery: {
        success: boolean;
        errors: Array<{
          code: string;
          field: string;
          message: string;
        }>;
      };
      zip4: {
        success: boolean;
        zip4: string;
      };
    };
  };
  suggestions?: ValidatedAddress[];
  errors?: string[];
}

export interface ValidatedAddress {
  id: string;
  street1: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  name: string;
  residential: boolean;
  verifications: {
    delivery: {
      success: boolean;
      errors: Array<{
        code: string;
        field: string;
        message: string;
      }>;
    };
    zip4: {
      success: boolean;
      zip4: string;
    };
  };
}