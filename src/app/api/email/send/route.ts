import { NextRequest, NextResponse } from 'next/server';
import { type EmailTemplate } from '@/lib/api/email';

// Email API Route - Storefront stub
// Transactional emails handled by Medusa backend via Resend.
// This stub remains for non-transactional emails if needed.

const VALID_TEMPLATES = [
  'order-confirmation',
  'shipping-notification',
  'payment-failed',
  'support-response',
  'warranty-claim',
  'support-request',
];

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

    // Validate template name
    if (!VALID_TEMPLATES.includes(template)) {
      return NextResponse.json(
        { error: `Template '${template}' not found` },
        { status: 400 }
      );
    }

    // Log email request (stubbed - no actual sending)
    console.log('📧 Email API (stubbed):', {
      to,
      subject,
      template,
      dataKeys: Object.keys(data)
    });

    // Return success with mock message ID
    // Actual email sending will be implemented via Medusa notifications
    return NextResponse.json({
      success: true,
      messageId: `stub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      note: 'Email stubbed - Medusa notifications pending'
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