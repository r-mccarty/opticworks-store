// API stubs for future Supabase integration
// These functions will be replaced with actual Supabase calls when backend is implemented

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled' | 'refunded';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paidAmount: number;
  refundedAmount: number;
  paymentMethod: {
    type: 'credit_card' | 'paypal' | 'apple_pay' | 'google_pay';
    last4?: string;
    brand?: string;
    expiryMonth?: number;
    expiryYear?: number;
  };
  billingAddress: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
  paidAt?: string;
  dueDate: string;
}

export interface RefundRequest {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  requestedAmount: number;
  reason: 'defective_product' | 'wrong_item' | 'not_as_described' | 'duplicate_charge' | 'other';
  reasonDetails: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'rejected';
  requestedBy: string;
  requestDate: string;
  processedDate?: string;
  refundMethod: 'original_payment' | 'store_credit';
  adminNotes?: string;
}

export interface BillingDispute {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  disputeType: 'unauthorized_charge' | 'billing_error' | 'service_not_received' | 'refund_not_processed' | 'other';
  description: string;
  evidence: {
    files: string[];
    description: string;
  };
  status: 'submitted' | 'under_review' | 'resolved' | 'escalated';
  submittedBy: string;
  submittedAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface PaymentRetryRequest {
  orderNumber: string;
  paymentMethodId: string;
  amount: number;
  currency: string;
}

// Stub data for demonstration - will be replaced with Supabase query
const stubInvoices: Record<string, Invoice> = {
  'INV-2024-001': {
    id: 'inv_1',
    invoiceNumber: 'INV-2024-001',
    orderNumber: 'ORD-2024-001',
    customerEmail: 'john.doe@email.com',
    customerName: 'John Doe',
    status: 'paid',
    subtotal: 149.99,
    tax: 13.65,
    shipping: 12.99,
    total: 176.63,
    paidAmount: 176.63,
    refundedAmount: 0,
    paymentMethod: {
      type: 'credit_card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2028
    },
    billingAddress: {
      firstName: 'John',
      lastName: 'Doe',
      address1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'US'
    },
    createdAt: '2024-08-25T10:00:00Z',
    paidAt: '2024-08-25T10:02:15Z',
    dueDate: '2024-08-25T10:00:00Z'
  },
  'INV-2024-002': {
    id: 'inv_2',
    invoiceNumber: 'INV-2024-002',
    orderNumber: 'ORD-2024-002',
    customerEmail: 'jane.smith@email.com',
    customerName: 'Jane Smith',
    status: 'pending',
    subtotal: 378.00,
    tax: 31.84,
    shipping: 15.99,
    total: 425.83,
    paidAmount: 0,
    refundedAmount: 0,
    paymentMethod: {
      type: 'credit_card',
      last4: '1234',
      brand: 'Mastercard',
      expiryMonth: 6,
      expiryYear: 2026
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
    createdAt: '2024-08-26T09:15:00Z',
    dueDate: '2024-08-26T09:15:00Z'
  }
};

/**
 * Fetch invoice by order number or invoice number and email
 * TODO: Replace with actual Supabase query when backend is implemented
 */
export async function fetchInvoice(
  identifier: string, // order number or invoice number
  email: string
): Promise<Invoice | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('invoices')
  //   .select('*')
  //   .or(`order_number.eq.${identifier},invoice_number.eq.${identifier}`)
  //   .eq('customer_email', email.toLowerCase())
  //   .single();
  
  // Search by order number or invoice number
  const invoice = Object.values(stubInvoices).find(
    inv => (inv.orderNumber === identifier || inv.invoiceNumber === identifier) &&
           inv.customerEmail.toLowerCase() === email.toLowerCase()
  );
  
  return invoice || null;
}

/**
 * Generate and return invoice PDF download URL
 * TODO: Replace with actual PDF generation service when backend is implemented
 */
export async function generateInvoicePDF(invoiceNumber: string, email: string): Promise<{
  success: boolean;
  downloadUrl?: string;
  error?: string;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verify invoice exists and email matches
  const invoice = await fetchInvoice(invoiceNumber, email);
  if (!invoice) {
    return {
      success: false,
      error: 'Invoice not found or email does not match'
    };
  }
  
  // TODO: Replace with actual PDF generation service
  // const pdfBuffer = await generatePDF(invoice);
  // const downloadUrl = await uploadToCloudStorage(pdfBuffer);
  
  // Return mock download URL
  return {
    success: true,
    downloadUrl: `https://example.com/invoices/${invoiceNumber}.pdf`
  };
}

/**
 * Submit refund request
 * TODO: Replace with actual Supabase call when backend is implemented
 */
export async function requestRefund(
  orderNumber: string,
  email: string,
  refundDetails: {
    amount: number;
    reason: RefundRequest['reason'];
    reasonDetails: string;
    refundMethod: 'original_payment' | 'store_credit';
  }
): Promise<{ success: boolean; requestId?: string; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Verify invoice exists
  const invoice = await fetchInvoice(orderNumber, email);
  if (!invoice) {
    return {
      success: false,
      error: 'Order not found or email does not match'
    };
  }
  
  // Check if refund amount is valid
  if (refundDetails.amount > (invoice.paidAmount - invoice.refundedAmount)) {
    return {
      success: false,
      error: 'Refund amount exceeds available refundable amount'
    };
  }
  
  // Check refund eligibility (e.g., time limits, order status)
  const daysSinceOrder = (Date.now() - new Date(invoice.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceOrder > 30) {
    return {
      success: false,
      error: 'Refund requests must be made within 30 days of purchase'
    };
  }
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('refund_requests')
  //   .insert({
  //     order_number: orderNumber,
  //     invoice_number: invoice.invoiceNumber,
  //     requested_amount: refundDetails.amount,
  //     reason: refundDetails.reason,
  //     reason_details: refundDetails.reasonDetails,
  //     refund_method: refundDetails.refundMethod,
  //     requested_by: email,
  //     status: 'pending'
  //   })
  //   .select()
  //   .single();
  
  const requestId = `REF-${Date.now()}`;
  
  return {
    success: true,
    requestId: requestId
  };
}

/**
 * Retry failed payment
 * TODO: Replace with actual Stripe/payment processor API when backend is implemented
 */
export async function retryPayment(
  orderNumber: string,
  email: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _paymentMethodId?: string
): Promise<{ success: boolean; paymentIntentId?: string; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Verify invoice exists and is unpaid
  const invoice = await fetchInvoice(orderNumber, email);
  if (!invoice) {
    return {
      success: false,
      error: 'Order not found or email does not match'
    };
  }
  
  if (invoice.status === 'paid') {
    return {
      success: false,
      error: 'Invoice has already been paid'
    };
  }
  
  // TODO: Replace with Stripe API call
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(invoice.total * 100),
  //   currency: 'usd',
  //   customer: customerId,
  //   payment_method: paymentMethodId,
  //   confirmation_method: 'manual',
  //   confirm: true
  // });
  
  // Simulate payment processing
  const success = Math.random() > 0.3; // 70% success rate
  
  if (success) {
    return {
      success: true,
      paymentIntentId: `pi_${Date.now()}`
    };
  } else {
    return {
      success: false,
      error: 'Payment failed. Please check your payment method and try again.'
    };
  }
}

/**
 * Submit billing dispute
 * TODO: Replace with actual Supabase call when backend is implemented
 */
export async function submitBillingDispute(
  orderNumber: string,
  email: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _disputeDetails: {
    disputeType: BillingDispute['disputeType'];
    description: string;
    evidence?: {
      files: File[];
      description: string;
    };
  }
): Promise<{ success: boolean; disputeId?: string; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Verify invoice exists
  const invoice = await fetchInvoice(orderNumber, email);
  if (!invoice) {
    return {
      success: false,
      error: 'Order not found or email does not match'
    };
  }
  
  // TODO: Handle file uploads to cloud storage
  // const fileUrls = [];
  // if (disputeDetails.evidence?.files) {
  //   for (const file of disputeDetails.evidence.files) {
  //     const url = await uploadFile(file);
  //     fileUrls.push(url);
  //   }
  // }
  
  // TODO: Replace with Supabase call
  // const { data, error } = await supabase
  //   .from('billing_disputes')
  //   .insert({
  //     order_number: orderNumber,
  //     invoice_number: invoice.invoiceNumber,
  //     dispute_type: disputeDetails.disputeType,
  //     description: disputeDetails.description,
  //     evidence: {
  //       files: fileUrls,
  //       description: disputeDetails.evidence?.description || ''
  //     },
  //     submitted_by: email,
  //     status: 'submitted'
  //   })
  //   .select()
  //   .single();
  
  const disputeId = `DIS-${Date.now()}`;
  
  return {
    success: true,
    disputeId: disputeId
  };
}

/**
 * Get billing analytics for admin/reporting
 * TODO: Replace with actual Supabase analytics query when backend is implemented
 */
export async function getBillingAnalytics(): Promise<{
  totalRevenue: number;
  pendingPayments: number;
  refundRequests: number;
  averageOrderValue: number;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 400));
  
  // TODO: Replace with Supabase analytics query
  const invoices = Object.values(stubInvoices);
  
  return {
    totalRevenue: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.paidAmount, 0),
    pendingPayments: invoices.filter(inv => inv.status === 'pending').length,
    refundRequests: 0, // Would come from refund_requests table
    averageOrderValue: invoices.reduce((sum, inv) => sum + inv.total, 0) / invoices.length
  };
}