'use client';

import { useEffect, useState, Suspense } from 'react';
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

function PaymentSuccessContent() {
  const { paymentSession } = useCart();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We can add a small delay to prevent flickering, as Zustand state hydration can be async
    const timer = setTimeout(() => setIsLoading(false), 150);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <OrderSuccessSkeleton />;
  }

  if (!paymentSession || !paymentSession.items || paymentSession.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ExclamationTriangleIcon className="h-20 w-20 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              Payment Information Missing
            </h1>
            <Card className="w-full text-left">
              <CardContent className="pt-6">
                <p className="text-lg text-red-700">
                  We couldn&apos;t find the details of your completed payment.
                  This can happen if you refresh the page or navigate here directly.
                </p>
                <p className="text-sm text-gray-600 mt-2">
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

  const total = paymentSession.items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500" />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Thank you for your order!
            </h1>
            <p className="text-lg text-gray-600">
              Your OpticWorks order is confirmed and will be on its way soon.
            </p>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="my-8">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
            <p className="text-sm text-gray-500 pt-1">
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
                      <p className="text-sm text-gray-500">
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
            <p className="text-xs text-gray-500">
              A detailed confirmation receipt has been sent to your email address.
            </p>
          </CardFooter>
        </Card>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Button asChild className="h-12">
            <Link href="/install-guides">
              📖 View Installation Guides
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-12">
            <Link href="/store">
              🛍️ Continue Shopping
            </Link>
          </Button>

          <Button variant="outline" asChild className="h-12">
            <Link href="/support">
              💬 Contact Support
            </Link>
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