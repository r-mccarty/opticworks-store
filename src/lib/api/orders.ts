// API stubs for future Supabase integration
// These functions will be replaced with actual Supabase calls when backend is implemented

export interface Order {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: Address;
  billingAddress: Address;
  trackingNumber?: string;
  estimatedDelivery?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface ShippingUpdate {
  date: string;
  status: string;
  location: string;
  description: string;
}

export interface OrderModificationRequest {
  orderNumber: string;
  requestType: 'address_change' | 'item_change' | 'cancellation';
  details: {
    newAddress?: Address;
    itemChanges?: { productId: string; newQuantity: number }[];
    cancellationReason?: string;
  };
  requestedBy: string;
  requestDate: string;
}

// Stub data for demonstration - will be replaced with Supabase query
const stubOrders: Record<string, Order> = {
  'ORD-2024-001': {
    id: 'ord_1',
    orderNumber: 'ORD-2024-001',
    customerEmail: 'john.doe@email.com',
    customerName: 'John Doe',
    status: 'shipped',
    items: [
      {
        productId: 'cybershade-irx-tesla-model-y',
        productName: 'CyberShade IRX™ Tesla Model Y Kit (2025+ Juniper)',
        quantity: 1,
        price: 149.99,
        image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=400&fit=crop&crop=center'
      }
    ],
    subtotal: 149.99,
    shipping: 12.99,
    tax: 13.65,
    total: 176.63,
    shippingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'US',
      phone: '555-0123'
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'US',
      phone: '555-0123'
    },
    trackingNumber: '1Z999AA1234567890',
    estimatedDelivery: '2024-08-28',
    createdAt: '2024-08-25T10:00:00Z',
    updatedAt: '2024-08-26T14:30:00Z'
  },
  'ORD-2024-002': {
    id: 'ord_2',
    orderNumber: 'ORD-2024-002',
    customerEmail: 'jane.smith@email.com',
    customerName: 'Jane Smith',
    status: 'processing',
    items: [
      {
        productId: 'cybershade-irx-35',
        productName: 'CyberShade IRX 35% VLT',
        quantity: 2,
        price: 189.00,
        image: 'https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=400&h=400&fit=crop&crop=center'
      }
    ],
    subtotal: 378.00,
    shipping: 15.99,
    tax: 31.84,
    total: 425.83,
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      address1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US'
    },
    billingAddress: {
      firstName: 'Jane',
      lastName: 'Smith',
      address1: '456 Oak Ave',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      country: 'US'
    },
    estimatedDelivery: '2024-08-30',
    createdAt: '2024-08-26T09:15:00Z',
    updatedAt: '2024-08-26T09:15:00Z'
  }
};

const stubShippingUpdates: Record<string, ShippingUpdate[]> = {
  '1Z999AA1234567890': [
    {
      date: '2024-08-26T08:00:00Z',
      status: 'In Transit',
      location: 'Austin, TX',
      description: 'Package is in transit to destination'
    },
    {
      date: '2024-08-25T16:30:00Z',
      status: 'Shipped',
      location: 'Dallas, TX',
      description: 'Package has been shipped from fulfillment center'
    },
    {
      date: '2024-08-25T14:00:00Z',
      status: 'Processing',
      location: 'Dallas, TX',
      description: 'Order is being prepared for shipment'
    }
  ]
};

/**
 * Fetch order details by order number and email
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function fetchOrderStatus(orderNumber: string, email: string): Promise<Order | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('orders')
  //   .select(`
  //     *,
  //     order_items(*),
  //     shipping_address(*),
  //     billing_address(*)
  //   `)
  //   .eq('order_number', orderNumber)
  //   .eq('customer_email', email.toLowerCase())
  //   .single();
  
  const order = stubOrders[orderNumber];
  
  // Verify email matches
  if (order && order.customerEmail.toLowerCase() === email.toLowerCase()) {
    return order;
  }
  
  return null;
}

/**
 * Fetch shipping tracking information
 * TODO: Replace with actual shipping provider API when backend is implemented
 */
export async function fetchShippingTracking(trackingNumber: string): Promise<ShippingUpdate[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // TODO: Replace with shipping provider API call (UPS, FedEx, USPS)
  // const response = await fetch(`https://api.ups.com/track/v1/details/${trackingNumber}`)
  
  return stubShippingUpdates[trackingNumber] || [];
}

/**
 * Submit order modification request
 * TODO: Replace with actual Supabase call when backend is implemented
 */
export async function requestOrderModification(
  orderNumber: string,
  email: string,
  _modification: Omit<OrderModificationRequest, 'orderNumber' | 'requestedBy' | 'requestDate'>
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Verify order exists and email matches
  const order = await fetchOrderStatus(orderNumber, email);
  if (!order) {
    return {
      success: false,
      error: 'Order not found or email does not match'
    };
  }
  
  // Check if order can be modified
  if (order.status === 'shipped' || order.status === 'delivered') {
    return {
      success: false,
      error: 'Order cannot be modified after it has been shipped'
    };
  }
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('order_modification_requests')
  //   .insert({
  //     order_number: orderNumber,
  //     request_type: modification.requestType,
  //     details: modification.details,
  //     requested_by: email,
  //     status: 'pending'
  //   })
  //   .select()
  //   .single();
  
  // Simulate success
  const requestId = `REQ-${Date.now()}`;
  
  return {
    success: true,
    requestId: requestId
  };
}

/**
 * Get shipping estimate for given location and items
 * TODO: Replace with actual shipping calculator API when backend is implemented
 */
export async function getShippingEstimate(
  zipCode: string, 
  _items: { weight: number; dimensions: { length: number; width: number; height: number } }[]
): Promise<{
  standard: { price: number; days: string };
  expedited: { price: number; days: string };
  overnight: { price: number; days: string };
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // TODO: Replace with shipping provider API call
  // Calculate basic estimates based on location zones
  const baseRate = zipCode.startsWith('9') ? 15.99 : 12.99; // West coast vs other
  
  return {
    standard: {
      price: baseRate,
      days: '5-7 business days'
    },
    expedited: {
      price: baseRate * 1.8,
      days: '2-3 business days'
    },
    overnight: {
      price: baseRate * 3.2,
      days: '1 business day'
    }
  };
}

/**
 * Get order statistics for admin/reporting
 * TODO: Replace with actual Supabase analytics query when backend is implemented
 */
export async function getOrderAnalytics(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  shippedOrders: number;
  averageOrderValue: number;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with Supabase analytics query
  return {
    totalOrders: Object.keys(stubOrders).length,
    pendingOrders: Object.values(stubOrders).filter(o => o.status === 'pending').length,
    shippedOrders: Object.values(stubOrders).filter(o => o.status === 'shipped').length,
    averageOrderValue: Object.values(stubOrders).reduce((sum, order) => sum + order.total, 0) / Object.values(stubOrders).length
  };
}