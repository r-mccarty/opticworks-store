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
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  totals: CheckoutTotals;
}

export interface CheckoutWrapperProps {
  customerInfo: CustomerInfo;
  shippingAddress: ShippingAddress;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
}