import { NextRequest, NextResponse } from 'next/server';

export interface TaxCalculationRequest {
  subtotal: number;
  shipping: number;
  shippingAddress: {
    state: string;
    zipCode: string;
    city: string;
  };
  items: Array<{
    id: string;
    price: number;
    quantity: number;
    taxable: boolean;
  }>;
}

export interface TaxRate {
  state: string;
  county?: string;
  city?: string;
  stateTaxRate: number;
  countyTaxRate: number;
  cityTaxRate: number;
  totalTaxRate: number;
}

// Simplified tax rates by state (in real app, use a tax API like TaxJar or Avalara)
const stateTaxRates: Record<string, number> = {
  'AL': 0.04,
  'AK': 0.0,
  'AZ': 0.056,
  'AR': 0.065,
  'CA': 0.0725,
  'CO': 0.029,
  'CT': 0.0635,
  'DE': 0.0,
  'FL': 0.06,
  'GA': 0.04,
  'HI': 0.04,
  'ID': 0.06,
  'IL': 0.0625,
  'IN': 0.07,
  'IA': 0.06,
  'KS': 0.065,
  'KY': 0.06,
  'LA': 0.0445,
  'ME': 0.055,
  'MD': 0.06,
  'MA': 0.0625,
  'MI': 0.06,
  'MN': 0.06875,
  'MS': 0.07,
  'MO': 0.04225,
  'MT': 0.0,
  'NE': 0.055,
  'NV': 0.0685,
  'NH': 0.0,
  'NJ': 0.06625,
  'NM': 0.05125,
  'NY': 0.08,
  'NC': 0.0475,
  'ND': 0.05,
  'OH': 0.0575,
  'OK': 0.045,
  'OR': 0.0,
  'PA': 0.06,
  'RI': 0.07,
  'SC': 0.06,
  'SD': 0.045,
  'TN': 0.07,
  'TX': 0.0625,
  'UT': 0.047,
  'VT': 0.06,
  'VA': 0.053,
  'WA': 0.065,
  'WV': 0.06,
  'WI': 0.05,
  'WY': 0.04,
  'DC': 0.06
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TaxCalculationRequest;
    const { subtotal, shipping, shippingAddress, items } = body;

    // Validate required fields
    if (!subtotal || !shippingAddress?.state || !items) {
      return NextResponse.json(
        { error: 'Missing required fields: subtotal, shippingAddress.state, items' },
        { status: 400 }
      );
    }

    console.log('💰 Tax calculation requested:', {
      state: shippingAddress.state,
      subtotal,
      itemCount: items.length
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    const state = shippingAddress.state.toUpperCase();
    const stateTaxRate = stateTaxRates[state] || 0;
    
    // Calculate taxable amount (exclude non-taxable items and shipping in some states)
    const taxableSubtotal = items.reduce((sum, item) => {
      return sum + (item.taxable ? item.price * item.quantity : 0);
    }, 0);
    
    // Some states don't tax shipping
    const shippingTaxExemptStates = ['CA', 'NY', 'TX', 'FL'];
    const taxableShipping = shippingTaxExemptStates.includes(state) ? 0 : shipping;
    
    const taxableAmount = taxableSubtotal + taxableShipping;
    const taxAmount = Math.round(taxableAmount * stateTaxRate * 100) / 100;

    const taxRate: TaxRate = {
      state,
      stateTaxRate,
      countyTaxRate: 0, // Simplified - would need county lookup in real implementation
      cityTaxRate: 0, // Simplified - would need city lookup in real implementation
      totalTaxRate: stateTaxRate
    };

    return NextResponse.json({
      success: true,
      taxAmount,
      taxableAmount,
      taxRate,
      breakdown: {
        stateTax: taxAmount,
        countyTax: 0,
        cityTax: 0
      }
    });

  } catch (error) {
    console.error('Tax calculation API error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate tax' },
      { status: 500 }
    );
  }
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}