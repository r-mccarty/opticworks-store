import { NextRequest, NextResponse } from 'next/server';
import React from 'react';
import { render } from '@react-email/render';
import { Resend } from 'resend';
import { type EmailTemplate } from '@/lib/api/email';
import OrderConfirmation from '@/lib/email/templates/OrderConfirmation';
import PaymentFailed from '@/lib/email/templates/PaymentFailed';
import SupportRequest from '@/lib/email/templates/SupportRequest';

// Email template mapping
const templates = {
  'order-confirmation': OrderConfirmation,
  'payment-failed': PaymentFailed,
  'support-request': SupportRequest,
  // Add more templates as they're created
  'shipping-notification': OrderConfirmation, // Placeholder
  'support-response': OrderConfirmation, // Placeholder
  'warranty-claim': OrderConfirmation, // Placeholder
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, template, data } = body as EmailTemplate;

    // Validate required fields
    if (!to || !subject || !template || !data) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, template, data' },
        { status: 400 }
      );
    }

    // Validate email template exists
    if (!templates[template]) {
      return NextResponse.json(
        { error: `Template '${template}' not found` },
        { status: 400 }
      );
    }

    // In development, just log and return success
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email API called:', {
        to,
        subject,
        template,
        dataKeys: Object.keys(data)
      });

      // Render template to verify it works
      try {
        const TemplateComponent = templates[template];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const element = React.createElement(TemplateComponent as any, data);
        const htmlContent = await render(element);
        console.log('✅ Email template rendered successfully');
        
        return NextResponse.json({
          success: true,
          messageId: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
          preview: htmlContent.substring(0, 200) + '...'
        });
      } catch (renderError) {
        console.error('❌ Email template render error:', renderError);
        return NextResponse.json(
          { error: 'Failed to render email template' },
          { status: 500 }
        );
      }
    }

    // Production email sending with Resend
    const resend = new Resend(process.env.RESEND_API_KEY);
    const TemplateComponent = templates[template];
    
    // Create React element and render it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(TemplateComponent as any, data);
    
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_FROM_EMAIL!,
      to,
      subject,
      react: element,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: emailData?.id
    });

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}