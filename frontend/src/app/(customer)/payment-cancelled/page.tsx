'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function PaymentCancelledContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="max-w-2xl mx-auto py-16 px-4 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-basmati p-12 rounded-3xl shadow-lg border border-bottle/10">
        {/* Cancel Icon */}
        <div className="w-28 h-28 bg-chili/10 border-4 border-chili/20 rounded-full flex items-center justify-center mx-auto mb-10">
          <svg className="w-14 h-14 text-chili" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h1 className="text-4xl md:text-5xl font-serif font-bold text-chili mb-4">Payment Cancelled</h1>
        <p className="text-ink/70 text-lg mb-4 leading-relaxed">
          No worries — your order has been saved but not yet confirmed.
        </p>
        <p className="text-ink/50 text-base mb-12">
          You can retry the payment or adjust your order before trying again. Your card has <strong className="text-ink/70">not been charged.</strong>
        </p>

        <div className="flex flex-col gap-4">
          {orderId && (
            <Link
              href={`/track/${orderId}`}
              className="block w-full py-4 bg-turmeric text-ink font-bold text-xl rounded-xl hover:bg-turmeric/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Retry Payment for This Order
            </Link>
          )}
          <Link
            href="/menu"
            className="block w-full py-4 bg-transparent border-2 border-turmeric text-ink hover:bg-turmeric hover:text-white font-bold text-xl rounded-xl transition-all"
          >
            Back to Menu
          </Link>
        </div>

        <p className="mt-8 text-xs text-ink/40">
          Need help? Contact our support team at support@zaiqa.com
        </p>
      </div>
    </div>
  );
}

export default function PaymentCancelledPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-80">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-turmeric"></div>
      </div>
    }>
      <PaymentCancelledContent />
    </Suspense>
  );
}
