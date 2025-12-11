import { create } from 'zustand';

/**
 * Minimal checkout state for cross-component communication.
 *
 * NOTE: This store only holds UI state for propagating tax info to CartPage.
 * All authoritative values (subtotal, total, tax_total, shipping_total) come
 * from the Medusa cart via useMedusaShipping hook in CheckoutForm.
 *
 * @see Phase 2 of Architecture Audit - simplified from original implementation
 */
interface CheckoutState {
  /** Tax amount from Medusa (propagated for CartPage display) */
  taxAmount: number;
  /** Whether tax is currently being calculated */
  isCalculatingTax: boolean;
  /** Set tax amount (called by CheckoutForm after shipping selection) */
  setTaxAmount: (amount: number) => void;
  /** Set calculating state (for loading UI) */
  setIsCalculatingTax: (calculating: boolean) => void;
  /** Reset state (called on payment success) */
  reset: () => void;
}

export const useCheckoutState = create<CheckoutState>((set) => ({
  taxAmount: 0,
  isCalculatingTax: false,

  setTaxAmount: (amount: number) => set({ taxAmount: amount }),

  setIsCalculatingTax: (calculating: boolean) => set({ isCalculatingTax: calculating }),

  reset: () => set({
    taxAmount: 0,
    isCalculatingTax: false,
  }),
}));
