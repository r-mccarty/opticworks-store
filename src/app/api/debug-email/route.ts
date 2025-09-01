import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Return environment variable status for debugging
    const debug = {
      hasResendApiKey: !!process.env.RESEND_API_KEY,
      resendApiKeyLength: process.env.RESEND_API_KEY?.length || 0,
      resendApiKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) || 'missing',
      hasFromEmail: !!process.env.NEXT_PUBLIC_FROM_EMAIL,
      fromEmail: process.env.NEXT_PUBLIC_FROM_EMAIL || 'missing',
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json({
      success: true,
      debug,
      message: 'Environment debug info'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        hasResendApiKey: false,
        message: 'Failed to access environment variables'
      }
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}