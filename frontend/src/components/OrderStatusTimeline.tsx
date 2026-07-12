import React from 'react';

const DINE_IN_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'];
const DELIVERY_STEPS = ['PLACED', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'COMPLETED'];

interface Props {
  currentStatus: string;
  orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY';
}

export default function OrderStatusTimeline({ currentStatus, orderType }: Props) {
  const isCancelled = currentStatus === 'CANCELLED';
  const steps = orderType === 'DELIVERY' ? DELIVERY_STEPS : DINE_IN_STEPS;
  
  if (isCancelled) {
    return (
      <div className="p-8 bg-chili/10 border-2 border-chili/20 rounded-2xl text-center shadow-sm">
        <div className="w-16 h-16 bg-chili text-white rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold font-serif text-chili mb-2">Order Cancelled</h3>
        <p className="text-chili/80 font-medium">Unfortunately, your order has been cancelled.</p>
      </div>
    );
  }

  const currentIndex = steps.indexOf(currentStatus);

  return (
    <div className="w-full py-6 md:py-10">
      <div className="relative flex items-center justify-between mx-6 md:mx-12">
        {/* Background line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-2 bg-bottle/10 rounded-full z-0"></div>
        
        {/* Active line */}
        <div 
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-2 bg-turmeric rounded-full z-0 transition-all duration-700 ease-out"
          style={{ width: `${(Math.max(0, currentIndex) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isPending = index > currentIndex;

          const displayLabel = step.replace(/_/g, ' ');

          return (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div 
                className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-4 flex items-center justify-center transition-all duration-500 bg-basmati
                  ${isCompleted ? 'border-turmeric bg-turmeric text-bottle scale-100' : ''}
                  ${isCurrent ? 'border-turmeric shadow-[0_0_20px_rgba(217,164,65,0.7)] animate-pulse scale-110' : ''}
                  ${isPending ? 'border-bottle/20 text-transparent scale-90' : ''}
                `}
              >
                {isCompleted && (
                  <svg className="w-5 h-5 md:w-7 md:h-7 text-bottle" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {isCurrent && (
                  <div className="w-3 h-3 md:w-4 md:h-4 bg-turmeric rounded-full shadow-inner"></div>
                )}
              </div>
              <span 
                className={`absolute top-14 md:top-16 text-[10px] md:text-sm font-bold text-center w-24 -ml-12 left-1/2 transition-colors duration-300
                  ${isCompleted || isCurrent ? 'text-bottle drop-shadow-sm' : 'text-bottle/40'}
                `}
              >
                {displayLabel}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="mt-20 md:mt-24 text-center px-4">
        <div className="inline-block px-6 py-3 bg-basmati rounded-xl border border-bottle/10 shadow-sm transition-all duration-300">
          {currentStatus === 'PLACED' && <p className="text-ink font-medium tracking-wide">Waiting for the restaurant to confirm your order...</p>}
          {currentStatus === 'CONFIRMED' && <p className="text-ink font-medium tracking-wide">Restaurant accepted your order. Kitchen is getting ready.</p>}
          {currentStatus === 'PREPARING' && <p className="text-turmeric font-bold tracking-wide">Chefs are preparing your delicious meal right now! 🔥</p>}
          {currentStatus === 'READY' && <p className="text-bottle font-bold tracking-wide">Your order is packed and ready to be picked up! 🛍️</p>}
          {currentStatus === 'OUT_FOR_DELIVERY' && <p className="text-bottle font-bold tracking-wide">Your meal is on its way to your address! 🛵</p>}
          {currentStatus === 'COMPLETED' && <p className="text-chili font-bold text-lg tracking-wide">Enjoy your meal! Thank you for choosing Zaiqa. ❤️</p>}
        </div>
      </div>
    </div>
  );
}
