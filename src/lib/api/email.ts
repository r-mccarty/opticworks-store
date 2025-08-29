// Email service API for React Email + Resend integration
import React from 'react';
import { Resend } from 'resend';
import OrderConfirmation from '@/lib/email/templates/OrderConfirmation';
import PaymentFailed from '@/lib/email/templates/PaymentFailed';

export interface EmailTemplate {
  to: string;
  subject: string;
  template: 'order-confirmation' | 'shipping-notification' | 'payment-failed' | 'support-response' | 'warranty-claim';
  data: Record<string, unknown>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Email template mapping
const templates = {
  'order-confirmation': OrderConfirmation,
  'payment-failed': PaymentFailed,
  // Add more templates as they're created
  'shipping-notification': OrderConfirmation, // Placeholder
  'support-response': OrderConfirmation, // Placeholder
  'warranty-claim': OrderConfirmation, // Placeholder
};

/**
 * Send email using React Email templates and Resend
 */
export async function sendEmail(email: EmailTemplate): Promise<EmailResult> {
  try {
    // In development, also log email details for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Sending email:', {
        to: email.to,
        subject: email.subject,
        template: email.template,
        dataKeys: Object.keys(email.data)
      });
    }

    // Get the template component
    const TemplateComponent = templates[email.template];
    if (!TemplateComponent) {
      return {
        success: false,
        error: `Template '${email.template}' not found`
      };
    }

    // Create React element and render it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(TemplateComponent as any, email.data);

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL!,
      to: email.to,
      subject: email.subject,
      react: element,
    });

    if (error) {
      console.error('Resend error:', error);
      return {
        success: false,
        error: 'Failed to send email'
      };
    }

    console.log('✅ Email sent successfully:', data?.id);
    return {
      success: true,
      messageId: data?.id
    };

  } catch (error) {
    console.error('Email service error:', error);
    return {
      success: false,
      error: 'Failed to send email'
    };
  }
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