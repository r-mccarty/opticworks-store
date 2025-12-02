// Email service API - Stubbed for Phase 3
// React Email templates removed due to Next.js 15.5.0 SSG conflict (RFD-009).
// Emails will be handled by Medusa notification system in Phase 4.

export interface EmailTemplate {
  to: string;
  subject: string;
  template: 'order-confirmation' | 'shipping-notification' | 'payment-failed' | 'support-response' | 'warranty-claim' | 'support-request';
  data: Record<string, unknown>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email - STUBBED
 * Logs the email request and returns success.
 * Actual email sending will be implemented via Medusa notifications in Phase 4.
 */
export async function sendEmail(email: EmailTemplate): Promise<EmailResult> {
  console.log(`📧 Email (stubbed): ${email.template} to ${email.to}`);
  console.log('📧 Email data keys:', Object.keys(email.data));

  // Return success with stub message ID
  return {
    success: true,
    messageId: `stub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  };
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(orderDetails: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
}): Promise<EmailResult> {
  console.log('📧 Sending order confirmation email to:', orderDetails.customerEmail);
  
  const result = await sendEmail({
    to: orderDetails.customerEmail,
    subject: `Order Confirmation - ${orderDetails.orderNumber}`,
    template: 'order-confirmation',
    data: orderDetails
  });

  if (result.success) {
    console.log('✅ Order confirmation email sent successfully');
  } else {
    console.error('❌ Failed to send order confirmation email:', result.error);
  }

  return result;
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailed(paymentDetails: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  amount: number;
  retryUrl: string;
}): Promise<EmailResult> {
  console.log('📧 Sending payment failed notification to:', paymentDetails.customerEmail);
  
  const result = await sendEmail({
    to: paymentDetails.customerEmail,
    subject: `Payment Failed - ${paymentDetails.orderNumber}`,
    template: 'payment-failed',
    data: paymentDetails
  });

  if (result.success) {
    console.log('✅ Payment failed notification sent successfully');
  } else {
    console.error('❌ Failed to send payment failed notification:', result.error);
  }

  return result;
}

/**
 * Send shipping notification
 */
export async function sendShippingNotification(shippingDetails: {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
  shippingCarrier: string;
}): Promise<EmailResult> {
  return sendEmail({
    to: shippingDetails.customerEmail,
    subject: `Your order has shipped - ${shippingDetails.orderNumber}`,
    template: 'shipping-notification',
    data: shippingDetails
  });
}

/**
 * Send support ticket response
 */
export async function sendSupportResponse(supportDetails: {
  customerEmail: string;
  customerName: string;
  ticketNumber: string;
  subject: string;
  response: string;
  agentName: string;
}): Promise<EmailResult> {
  return sendEmail({
    to: supportDetails.customerEmail,
    subject: `Support Response - ${supportDetails.ticketNumber}`,
    template: 'support-response',
    data: supportDetails
  });
}

/**
 * Send warranty claim confirmation
 */
export async function sendWarrantyClaimConfirmation(warrantyDetails: {
  customerEmail: string;
  customerName: string;
  claimNumber: string;
  productName: string;
  issue: string;
  nextSteps: string;
}): Promise<EmailResult> {
  return sendEmail({
    to: warrantyDetails.customerEmail,
    subject: `Warranty Claim Received - ${warrantyDetails.claimNumber}`,
    template: 'warranty-claim',
    data: warrantyDetails
  });
}

/**
 * Send support request notification to support team
 */
export async function sendSupportRequest(supportDetails: {
  supportEmail: string; // Where to send the support request
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category: string;
  orderNumber?: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
}): Promise<EmailResult> {
  console.log('📧 Sending support request to:', supportDetails.supportEmail);
  
  const result = await sendEmail({
    to: supportDetails.supportEmail,
    subject: `Support Request: ${supportDetails.subject} [${supportDetails.category.toUpperCase()}]`,
    template: 'support-request',
    data: {
      customerName: supportDetails.customerName,
      customerEmail: supportDetails.customerEmail,
      customerPhone: supportDetails.customerPhone,
      category: supportDetails.category,
      orderNumber: supportDetails.orderNumber,
      subject: supportDetails.subject,
      message: supportDetails.message,
      priority: supportDetails.priority,
      submittedAt: new Date().toLocaleString(),
    }
  });

  if (result.success) {
    console.log('✅ Support request sent successfully');
  } else {
    console.error('❌ Failed to send support request:', result.error);
  }

  return result;
}

/**
 * Get email sending analytics for admin dashboard
 * TODO: Replace with actual email service analytics when backend is implemented
 */
export async function getEmailAnalytics(): Promise<{
  totalSent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
}> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // TODO: Replace with actual Resend analytics
  return {
    totalSent: 1250,
    delivered: 1223,
    bounced: 27,
    opened: 892,
    clicked: 234
  };
}