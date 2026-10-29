'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import Link from 'next/link';
import { useCart, CartItem } from '@/hooks/useCart';
import { OrderSuccessSkeleton } from '@/components/skeletons/order-success-skeleton';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { getOrder } from '@/lib/api/medusa';

interface OrderData {
  id: string;
  display_id: number;
  email: string;
  items: Array<{
    id: string;
    title: string;
    quantity: number;
    unit_price: number;
    thumbnail?: string;
  }>;
  total: number;
}

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const { paymentSession } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  // Get order ID from URL - it might be in session_id or payment_intent parameter
  const sessionId = searchParams.get('session_id');
  const paymentIntent = searchParams.get('payment_intent');
  const orderId = sessionId || paymentIntent;

  useEffect(() => {
    async function fetchOrderData() {
      // PRIORITY: If we have an order ID in URL, always fetch from Medusa
      // This ensures we show the actual order, not stale localStorage data
      if (orderId && orderId.startsWith('order_')) {
        try {
          console.log('[success] Fetching order details for:', orderId);
          const order = await getOrder(orderId);
          setOrderData({
            id: order.id,
            display_id: order.display_id,
            email: order.email,
            items: order.items.map(item => ({
              id: item.id,
              title: item.title,
              quantity: item.quantity,
              unit_price: item.unit_price,
              thumbnail: item.thumbnail,
            })),
            total: order.total,
          });
          console.log('[success] Order data loaded successfully');
          setIsLoading(false);
          return;
        } catch (err) {
          console.error('[success] Failed to fetch order:', err);
          // Fall through to paymentSession fallback
        }
      }

      // Fallback: use paymentSession from cart if no order ID or fetch failed
      // This is legacy behavior for backwards compatibility
      if (paymentSession && paymentSession.items && paymentSession.items.length > 0) {
        console.log('[success] Using paymentSession fallback (no order ID or fetch failed)');
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
    }

    fetchOrderData();
  }, [orderId, paymentSession]);

  if (isLoading) {
    return <OrderSuccessSkeleton />;
  }

  // PRIORITY: If we fetched order data from Medusa, display it first
  if (orderData) {
    // Medusa v2 stores prices in major units (dollars), no conversion needed
    const totalDollars = orderData.total;

    return (
      <div className="min-h-screen bg-background text-foreground pt-40 px-4 sm:px-6 lg:px-8" data-testid="order-success">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <CheckCircleIcon className="h-20 w-20 text-secondary" data-testid="success-icon" />
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-foreground">
                Thank you for your order!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your OpticWorks order is confirmed and will be on its way soon.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <Card className="my-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Order #{orderData.display_id}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      {item.thumbnail && (
                        <Image
                          src={item.thumbnail}
                          alt={item.title}
                          width={64}
                          height={64}
                          className="rounded-md"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ${(item.unit_price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <p>Total Paid</p>
                <p>${totalDollars.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                A confirmation receipt has been sent to {orderData.email}.
              </p>
            </CardFooter>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button asChild className="h-12">
              <Link href="/install-guides">
                View Installation Guides
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-12">
              <Link href="/store">
                Continue Shopping
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-12">
              <Link href="/support">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Fallback: If we have paymentSession from cart, use that (legacy behavior)
  if (paymentSession && paymentSession.items && paymentSession.items.length > 0) {
    const total = paymentSession.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
      <div className="min-h-screen bg-background text-foreground pt-40 px-4 sm:px-6 lg:px-8" data-testid="order-success">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <CheckCircleIcon className="h-20 w-20 text-secondary" data-testid="success-icon" />
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-foreground">
                Thank you for your order!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your OpticWorks order is confirmed and will be on its way soon.
              </p>
            </div>
          </div>

          {/* Order Summary */}
          <Card className="my-8">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Payment ID: {paymentSession.sessionId.split('_')[1]}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentSession.items.map((item: CartItem) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="rounded-md"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-bold text-lg">
                <p>Total Paid</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </CardContent>
             <CardFooter>
              <p className="text-xs text-muted-foreground">
                A detailed confirmation receipt has been sent to your email address.
              </p>
            </CardFooter>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button asChild className="h-12">
              <Link href="/install-guides">
                View Installation Guides
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-12">
              <Link href="/store">
                Continue Shopping
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-12">
              <Link href="/support">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If we have an order ID but couldn't fetch details, show a generic success message
  if (orderId) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-40 px-4 sm:px-6 lg:px-8" data-testid="order-success">
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-6 text-center">
            <CheckCircleIcon className="h-20 w-20 text-secondary" data-testid="success-icon" />
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold text-foreground">
                Thank you for your order!
              </h1>
              <p className="text-lg text-muted-foreground">
                Your payment was successful and your order is being processed.
              </p>
            </div>
          </div>

          <Card className="my-8">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                Your order confirmation and receipt will be sent to your email shortly.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                Reference: {orderId}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Button asChild className="h-12">
              <Link href="/install-guides">
                View Installation Guides
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-12">
              <Link href="/store">
                Continue Shopping
              </Link>
            </Button>

            <Button variant="outline" asChild className="h-12">
              <Link href="/support">
                Contact Support
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // No order ID and no payment session - show error
  return (
    <div className="min-h-screen bg-background text-foreground pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ExclamationTriangleIcon className="h-20 w-20 text-destructive" />
          <h1 className="text-3xl font-semibold text-foreground">
            Payment Information Missing
          </h1>
          <Card className="w-full text-left">
            <CardContent className="pt-6">
              <p className="text-lg text-destructive">
                We couldn&apos;t find the details of your completed payment.
                This can happen if you refresh the page or navigate here directly.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please check your email for a confirmation receipt. If you don&apos;t receive one shortly, please contact our support team.
              </p>
            </CardContent>
          </Card>
          <Button asChild>
            <Link href="/support/contact">Contact Support</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<OrderSuccessSkeleton />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
