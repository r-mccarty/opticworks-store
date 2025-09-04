export interface GAEvent {
  action: string
  category: string
  label?: string
  value?: number
}

export interface GAEcommerceItem {
  item_id: string
  item_name: string
  category?: string
  quantity?: number
  price?: number
}

export interface GAPurchaseEvent {
  transaction_id: string
  value: number
  currency: string
  items: GAEcommerceItem[]
}

// Helper function to track Google Analytics events
export const trackGAEvent = ({ action, category, label, value }: GAEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Helper function to track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID!, {
      page_path: url,
    })
  }
}

// Helper function to track purchases
export const trackPurchase = ({ transaction_id, value, currency, items }: GAPurchaseEvent) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id,
      value,
      currency,
      items,
    })
  }
}

// Helper function to track add to cart
export const trackAddToCart = (item: GAEcommerceItem) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'add_to_cart', {
      currency: 'USD',
      value: item.price || 0,
      items: [item],
    })
  }
}

// Helper function to track remove from cart
export const trackRemoveFromCart = (item: GAEcommerceItem) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'remove_from_cart', {
      currency: 'USD',
      value: item.price || 0,
      items: [item],
    })
  }
}

// Helper function to track view item
export const trackViewItem = (item: GAEcommerceItem) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'view_item', {
      currency: 'USD',
      value: item.price || 0,
      items: [item],
    })
  }
}

// Helper function to track begin checkout
export const trackBeginCheckout = (items: GAEcommerceItem[], value: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'begin_checkout', {
      currency: 'USD',
      value,
      items,
    })
  }
}

// Generic function to integrate with existing analytics API while also sending to GA
export const trackAnalyticsEvent = async (eventData: {
  event: string
  properties: Record<string, unknown>
  sessionId?: string
  userId?: string
  userEmail?: string
}) => {
  try {
    // Send to existing analytics API
    const response = await fetch('/api/analytics/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    })

    // Also send to Google Analytics based on event type
    const { event, properties } = eventData

    switch (event) {
      case 'product_viewed':
        if (properties.productId && properties.productName) {
          trackViewItem({
            item_id: String(properties.productId),
            item_name: String(properties.productName),
            category: String(properties.category || 'product'),
            price: Number(properties.price || 0),
          })
        }
        break

      case 'product_added_to_cart':
        if (properties.productId && properties.productName) {
          trackAddToCart({
            item_id: String(properties.productId),
            item_name: String(properties.productName),
            category: String(properties.category || 'product'),
            quantity: Number(properties.quantity || 1),
            price: Number(properties.price || 0),
          })
        }
        break

      case 'product_removed_from_cart':
        if (properties.productId && properties.productName) {
          trackRemoveFromCart({
            item_id: String(properties.productId),
            item_name: String(properties.productName),
            category: String(properties.category || 'product'),
            quantity: Number(properties.quantity || 1),
            price: Number(properties.price || 0),
          })
        }
        break

      case 'checkout_started':
        if (properties.cartItems && properties.cartValue) {
          // For begin_checkout, we'd need the full cart items
          // This is a simplified version
          trackGAEvent({
            action: 'begin_checkout',
            category: 'ecommerce',
            value: Number(properties.cartValue),
          })
        }
        break

      case 'order_created':
        if (properties.orderId && properties.totalAmount && properties.items) {
          trackPurchase({
            transaction_id: String(properties.orderId),
            value: Number(properties.totalAmount),
            currency: 'USD',
            items: (properties.items as Array<{
              productId: string
              productName: string
              quantity: number
              price: number
            }>).map((item) => ({
              item_id: String(item.productId),
              item_name: String(item.productName),
              quantity: Number(item.quantity),
              price: Number(item.price),
            })),
          })
        }
        break

      default:
        // For other events, send a generic GA event
        trackGAEvent({
          action: event,
          category: 'custom',
          label: properties.label as string,
          value: properties.value as number,
        })
    }

    return response
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return null
  }
}