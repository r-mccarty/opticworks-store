import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
            Payment Successful!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Thank you for your order. You&apos;ll receive a confirmation email shortly.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full">
            <Link href="/install-guides">
              View Installation Guides
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="w-full">
            <Link href="/store">
              Continue Shopping
            </Link>
          </Button>
          
          <Button variant="ghost" asChild className="w-full">
            <Link href="/support">
              Contact Support
            </Link>
          </Button>
        </div>
        
        <div className="text-center text-xs text-gray-500">
          <p>
            Need help? Contact us at{' '}
            <a href="mailto:support@mccarty.ventures" className="text-blue-600 hover:underline">
              support@mccarty.ventures
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}