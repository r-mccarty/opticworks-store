import { NextRequest, NextResponse } from 'next/server';
import { getAddressSuggestions, type AddressInput } from '@/lib/api/easypost';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as AddressInput;
    
    // Validate required fields
    if (!body.street1 || !body.city || !body.state || !body.zip) {
      return NextResponse.json(
        { 
          success: false, 
          suggestions: [],
          originalAddress: body,
        },
        { status: 400 }
      );
    }

    // Get address suggestions with EasyPost
    const suggestionResult = await getAddressSuggestions(body);
    
    return NextResponse.json(suggestionResult);

  } catch (error) {
    console.error('Address suggestions API error:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        suggestions: [],
        originalAddress: {},
      },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}