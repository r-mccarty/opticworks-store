import { NextRequest, NextResponse } from 'next/server';

export interface InventoryCheckRequest {
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

export interface InventoryStatus {
  id: string;
  available: number;
  reserved: number;
  incoming: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'backordered';
  estimatedRestockDate?: string;
}

// Mock inventory data - in real app this would come from database
const mockInventory: Record<string, {
  available: number;
  reserved: number;
  incoming: number;
  restockDate?: string;
}> = {
  // Tesla Model Y Films
  'cybershade-irx-front-windshield': { available: 25, reserved: 3, incoming: 50 },
  'cybershade-irx-side-windows': { available: 45, reserved: 8, incoming: 0 },
  'cybershade-irx-rear-window': { available: 12, reserved: 2, incoming: 30 },
  'cybershade-irx-sunroof': { available: 8, reserved: 1, incoming: 20 },
  
  // Model 3 Films
  'cybershade-irx-model3-full-kit': { available: 35, reserved: 5, incoming: 0 },
  'cybershade-irx-model3-sides': { available: 22, reserved: 4, incoming: 25 },
  
  // Model S Films
  'cybershade-irx-models-premium': { available: 18, reserved: 2, incoming: 15 },
  
  // Model X Films
  'cybershade-irx-modelx-falcon': { available: 6, reserved: 1, incoming: 10, restockDate: '2025-09-15' },
  
  // Installation Kits
  'pro-install-kit': { available: 150, reserved: 20, incoming: 100 },
  'basic-install-kit': { available: 200, reserved: 15, incoming: 0 },
  
  // Tools and Accessories
  'professional-squeegee-set': { available: 75, reserved: 8, incoming: 50 },
  'heat-gun-professional': { available: 12, reserved: 2, incoming: 8, restockDate: '2025-09-10' }
};

function getInventoryStatus(available: number, reserved: number): InventoryStatus['status'] {
  const actualAvailable = available - reserved;
  
  if (actualAvailable <= 0) return 'out_of_stock';
  if (actualAvailable <= 5) return 'low_stock';
  if (actualAvailable <= 10) return 'low_stock';
  return 'in_stock';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as InventoryCheckRequest;
    const { items } = body;

    // Validate required fields
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Missing required field: items array' },
        { status: 400 }
      );
    }

    console.log('📦 Inventory check requested:', {
      itemCount: items.length,
      items: items.map(item => `${item.id} (qty: ${item.quantity})`)
    });

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const inventoryResults: InventoryStatus[] = [];
    let allItemsAvailable = true;
    let hasLowStock = false;

    for (const item of items) {
      const inventory = mockInventory[item.id];
      
      if (!inventory) {
        // Item not found in inventory system
        inventoryResults.push({
          id: item.id,
          available: 0,
          reserved: 0,
          incoming: 0,
          status: 'out_of_stock'
        });
        allItemsAvailable = false;
        continue;
      }

      const actualAvailable = inventory.available - inventory.reserved;
      const status = getInventoryStatus(inventory.available, inventory.reserved);
      const canFulfill = actualAvailable >= item.quantity;

      if (!canFulfill) {
        allItemsAvailable = false;
      }

      if (status === 'low_stock') {
        hasLowStock = true;
      }

      inventoryResults.push({
        id: item.id,
        available: actualAvailable,
        reserved: inventory.reserved,
        incoming: inventory.incoming,
        status,
        estimatedRestockDate: inventory.restockDate
      });
    }

    return NextResponse.json({
      success: true,
      allItemsAvailable,
      hasLowStock,
      inventory: inventoryResults,
      summary: {
        totalItems: items.length,
        inStock: inventoryResults.filter(i => i.status === 'in_stock').length,
        lowStock: inventoryResults.filter(i => i.status === 'low_stock').length,
        outOfStock: inventoryResults.filter(i => i.status === 'out_of_stock').length,
        backordered: inventoryResults.filter(i => i.status === 'backordered').length
      }
    });

  } catch (error) {
    console.error('Inventory check API error:', error);
    return NextResponse.json(
      { error: 'Failed to check inventory' },
      { status: 500 }
    );
  }
}

// GET endpoint for checking single item inventory
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const itemId = searchParams.get('id');

  if (!itemId) {
    return NextResponse.json(
      { error: 'Missing required parameter: id' },
      { status: 400 }
    );
  }

  const inventory = mockInventory[itemId];
  
  if (!inventory) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    );
  }

  const actualAvailable = inventory.available - inventory.reserved;
  const status = getInventoryStatus(inventory.available, inventory.reserved);

  return NextResponse.json({
    success: true,
    inventory: {
      id: itemId,
      available: actualAvailable,
      reserved: inventory.reserved,
      incoming: inventory.incoming,
      status,
      estimatedRestockDate: inventory.restockDate
    }
  });
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}