'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { OrderSuccessSkeleton } from '@/components/skeletons/order-success-skeleton';

interface OrderData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
}

function PaymentSuccessContent() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    clearCart();

    if (!paymentIntentId) {
      setError('Payment information is missing. Please contact support.');
      setIsLoading(false);
      return;
    }

    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(
          `/api/order-details?paymentIntentId=${paymentIntentId}`
        );
        if (response.ok) {
          const data = await response.json();
          setOrderData(data);
          setError(null);
        } else {
          const errorData = await response.json();
          setError(
            errorData.error || 'Failed to retrieve order details. Please contact support.'
          );
        }
      } catch (err) {
        setError('An unexpected error occurred. Please contact support.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [paymentIntentId, clearCart]);

  if (isLoading) {
    return <OrderSuccessSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 pt-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ExclamationTriangleIcon className="h-20 w-20 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">
              An Error Occurred
            </h1>
            <Card className="w-full text-left">
              <CardContent className="pt-6">
                <p className="text-lg text-red-700">{error}</p>
                {paymentIntentId && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500">
                      Payment Reference ID
                    </p>
                    <p className="text-sm font-mono text-gray-700 bg-gray-100 p-2 rounded">
                      {paymentIntentId}
                    </p>
                  </div>
                )}
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

  if (!orderData) {
    // This case should ideally not be reached if loading and error states are handled correctly
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-40 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <CheckCircleIcon className="h-20 w-20 text-green-500" />
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900">
              Thank you, {orderData.customerName}!
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Order ID</p>
                <p className="text-lg font-mono">{orderData.orderId}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">
                  ${orderData.total.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* What's Next? */}
        <div className="text-left bg-blue-50 p-6 rounded-lg mb-8">
          <h3 className="font-semibold text-blue-900 mb-2 text-lg">What&apos;s Next?</h3>
          <p className="text-sm text-blue-800">
            A confirmation receipt has been sent to{' '}
            <span className="font-medium">{orderData.customerEmail}</span>.
            You&apos;ll receive another email with tracking information within 1-2 business days.
          </p>
        </div>

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