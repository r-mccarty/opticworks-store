import { Page } from '@playwright/test';

export interface CartState {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    variantId?: string;
    lineItemId?: string;
  }>;
  cartId: string | null;
  regionId: string | null;
  syncStatus: string;
  syncError: string | null;
  paymentSession: unknown;
}

/**
 * Get the cart storage state from localStorage.
 * The cart uses Zustand with localStorage persistence under key 'cart-storage'.
 */
export async function getCartStorage(page: Page): Promise<CartState | null> {
  return await page.evaluate(() => {
    const stored = localStorage.getItem('cart-storage');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return parsed.state ?? null;
    } catch {
      return null;
    }
  });
}

/**
 * Clear the cart storage to start with a clean state.
 */
export async function clearCartStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('cart-storage');
  });
}

/**
 * Log the current cart state with a label.
 */
export async function logCartState(page: Page, label: string): Promise<CartState | null> {
  const state = await getCartStorage(page);
  console.log(`\n[CART STATE - ${label}]`);
  if (state) {
    console.log(`  Cart ID: ${state.cartId || 'none'}`);
    console.log(`  Region ID: ${state.regionId || 'none'}`);
    console.log(`  Sync Status: ${state.syncStatus}`);
    console.log(`  Sync Error: ${state.syncError || 'none'}`);
    console.log(`  Items (${state.items?.length || 0}):`);
    state.items?.forEach((item, i) => {
      console.log(
        `    ${i + 1}. ${item.name} x${item.quantity} @ $${item.price} (variant: ${item.variantId || 'none'})`
      );
    });
  } else {
    console.log('  No cart state found in localStorage');
  }
  return state;
}

/**
 * Get all localStorage contents for debugging.
 */
export async function getAllStorage(page: Page): Promise<Record<string, string>> {
  return await page.evaluate(() => {
    const items: Record<string, string> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        items[key] = localStorage.getItem(key) ?? '';
      }
    }
    return items;
  });
}

/**
 * Check if cart has items.
 */
export async function cartHasItems(page: Page): Promise<boolean> {
  const state = await getCartStorage(page);
  return (state?.items?.length ?? 0) > 0;
}

/**
 * Get the number of items in cart.
 */
export async function getCartItemCount(page: Page): Promise<number> {
  const state = await getCartStorage(page);
  return state?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}
