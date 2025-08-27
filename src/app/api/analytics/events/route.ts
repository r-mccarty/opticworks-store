import { NextRequest, NextResponse } from 'next/server';

export interface AnalyticsEvent {
  event: string;
  properties: Record<string, unknown>;
  timestamp?: string;
  sessionId?: string;
  userId?: string;
  userEmail?: string;
}

export interface OrderTrackingEvent extends AnalyticsEvent {
  event: 'order_created' | 'order_updated' | 'order_shipped' | 'order_delivered' | 'order_cancelled';
  properties: {
    orderId: string;
    orderNumber: string;
    customerEmail: string;
    totalAmount: number;
    items: Array<{
      productId: string;
      productName: string;
      quantity: number;
      price: number;
    }>;
    shippingMethod?: string;
    trackingNumber?: string;
    status: string;
  };
}

export interface ProductAnalyticsEvent extends AnalyticsEvent {
  event: 'product_viewed' | 'product_added_to_cart' | 'product_removed_from_cart' | 'cart_viewed' | 'checkout_started';
  properties: {
    productId?: string;
    productName?: string;
    category?: string;
    price?: number;
    quantity?: number;
    cartValue?: number;
    cartItems?: number;
  };
}

// In-memory storage for development (use Redis/Database in production)
const eventStore: AnalyticsEvent[] = [];
const maxStoredEvents = 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Handle single event or batch of events
    const events = Array.isArray(body) ? body : [body];
    
    const processedEvents: AnalyticsEvent[] = [];
    
    for (const eventData of events) {
      const { event, properties, sessionId, userId, userEmail } = eventData;
      
      // Validate required fields
      if (!event || !properties) {
        return NextResponse.json(
          { error: 'Missing required fields: event, properties' },
          { status: 400 }
        );
      }

      const analyticsEvent: AnalyticsEvent = {
        event,
        properties,
        timestamp: new Date().toISOString(),
        sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId,
        userEmail
      };

      processedEvents.push(analyticsEvent);
    }

    // Store events (in production, send to analytics service like Mixpanel, Amplitude, etc.)
    eventStore.push(...processedEvents);
    
    // Keep only the most recent events to prevent memory issues
    if (eventStore.length > maxStoredEvents) {
      eventStore.splice(0, eventStore.length - maxStoredEvents);
    }

    console.log('📊 Analytics events tracked:', {
      eventCount: processedEvents.length,
      events: processedEvents.map(e => ({
        event: e.event,
        timestamp: e.timestamp,
        userId: e.userId,
        sessionId: e.sessionId
      }))
    });

    // Simulate analytics service delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return NextResponse.json({
      success: true,
      eventsProcessed: processedEvents.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to track events' },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving analytics data (for admin dashboard)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventType = searchParams.get('event');
  const limit = parseInt(searchParams.get('limit') || '50');
  const userId = searchParams.get('userId');
  const sessionId = searchParams.get('sessionId');

  let filteredEvents = [...eventStore];

  // Apply filters
  if (eventType) {
    filteredEvents = filteredEvents.filter(e => e.event === eventType);
  }
  
  if (userId) {
    filteredEvents = filteredEvents.filter(e => e.userId === userId);
  }
  
  if (sessionId) {
    filteredEvents = filteredEvents.filter(e => e.sessionId === sessionId);
  }

  // Sort by timestamp (newest first) and limit results
  filteredEvents = filteredEvents
    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
    .slice(0, limit);

  // Generate summary statistics
  const eventCounts = filteredEvents.reduce((acc, event) => {
    acc[event.event] = (acc[event.event] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const uniqueUsers = new Set(filteredEvents.filter(e => e.userId).map(e => e.userId)).size;
  const uniqueSessions = new Set(filteredEvents.map(e => e.sessionId)).size;

  return NextResponse.json({
    success: true,
    events: filteredEvents,
    summary: {
      totalEvents: filteredEvents.length,
      uniqueUsers,
      uniqueSessions,
      eventBreakdown: eventCounts,
      dateRange: {
        earliest: filteredEvents.length > 0 ? filteredEvents[filteredEvents.length - 1].timestamp : null,
        latest: filteredEvents.length > 0 ? filteredEvents[0].timestamp : null
      }
    },
    filters: {
      eventType,
      userId,
      sessionId,
      limit
    }
  });
}

// Handle preflight requests for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}