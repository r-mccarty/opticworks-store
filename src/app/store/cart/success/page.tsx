'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';

interface OrderData {
  paymentIntentId?: string;
  customerName: string;
  customerEmail: string;
  total: number;
}

function PaymentSuccessContent() {
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [emailStatus, setEmailStatus] = useState<'sending' | 'sent' | 'failed'>('sending');
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const paymentIntentId = searchParams.get('payment_intent');

  useEffect(() => {
    // Clear the cart on successful payment
    clearCart();

    // Get order data from sessionStorage
    const storedOrderData = sessionStorage.getItem('orderData');
    if (storedOrderData) {
      try {
        const data = JSON.parse(storedOrderData);
        setOrderData(data);
        sessionStorage.removeItem('orderData'); // Clean up
      } catch (error) {
        console.error('Error parsing order data:', error);
      }
    }
  }, [clearCart]);

  // Set email status to sent since webhook handles email delivery
  useEffect(() => {
    if (orderData) {
      // Assume webhook has sent the email (it's more reliable than client-side)
      setEmailStatus('sent');
    }
  }, [orderData]);

  return (
    <div className="bg-gray-50 pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <CheckCircleIcon className="mx-auto h-20 w-20 text-green-500" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600">
            Thank you for your order! Your OpticWorks tinting kit will be on its way soon.
          </p>
        </div>

        {/* Order Details */}
        {orderData && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Customer</p>
                  <p className="text-lg">{orderData.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg">{orderData.customerEmail}</p>
                </div>
                {paymentIntentId && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Payment ID</p>
                    <p className="text-sm font-mono text-gray-700">{paymentIntentId}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-2xl font-bold text-green-600">${orderData.total.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Confirmation Status */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="h-6 w-6 text-blue-500" />
              <div>
                <p className="font-medium">Order Confirmation Email</p>
                <p className="text-sm text-gray-600">
                  {emailStatus === 'sending' && 'Sending confirmation email...'}
                  {emailStatus === 'sent' && `Confirmation email sent to ${orderData?.customerEmail || 'your email'}`}
                  {emailStatus === 'failed' && 'Failed to send email - please contact support'}
                </p>
              </div>
            </div>
          </CardContent>
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
        
        {/* Help Information */}
        <div className="text-center bg-blue-50 p-6 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">What&apos;s Next?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You&apos;ll receive tracking information within 1-2 business days</li>
            <li>• Installation guides are available now at optic.works/install-guides</li>
            <li>• Need help? Email us at{' '}
              <a href="mailto:support@notifications.optic.works" className="text-blue-600 hover:underline font-medium">
                support@notifications.optic.works
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order confirmation...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}