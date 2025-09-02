import { create } from 'zustand';

interface ShippingAddress {
  line1: string;
  city: string;
  state: string;
  postal_code: string;
  country?: string;
}

interface CheckoutState {
  taxAmount: number;
  isCalculatingTax: boolean;
  shippingAddress: ShippingAddress | null;
  subtotal: number;
  total: number;
  setTaxAmount: (amount: number) => void;
  setIsCalculatingTax: (calculating: boolean) => void;
  setShippingAddress: (address: ShippingAddress | null) => void;
  setSubtotal: (subtotal: number) => void;
  updateTotal: () => void;
  reset: () => void;
}

export const useCheckoutState = create<CheckoutState>((set, get) => ({
  taxAmount: 0,
  isCalculatingTax: false,
  shippingAddress: null,
  subtotal: 0,
  total: 0,
  
  setTaxAmount: (amount: number) => {
    set({ taxAmount: amount });
    get().updateTotal();
  },
  
  setIsCalculatingTax: (calculating: boolean) => 
    set({ isCalculatingTax: calculating }),
  
  setShippingAddress: (address: ShippingAddress | null) => 
    set({ shippingAddress: address }),
  
  setSubtotal: (subtotal: number) => {
    set({ subtotal });
    get().updateTotal();
  },
  
  updateTotal: () => {
    const { subtotal, taxAmount } = get();
    set({ total: subtotal + taxAmount });
  },
  
  reset: () => set({
    taxAmount: 0,
    isCalculatingTax: false,
    shippingAddress: null,
    subtotal: 0,
    total: 0,
  }),
}));