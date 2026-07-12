'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

const reservationSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  guests: z.number().min(1, 'At least 1 guest required').max(20, 'Maximum 20 guests allowed online'),
  specialRequests: z.string().optional(),
});

type ReservationFormValues = z.infer<typeof reservationSchema>;

// Pre-defined time slots for the restaurant
const TIME_SLOTS = [
  '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', 
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM', '08:30 PM', '09:00 PM', '09:30 PM', '10:00 PM'
];

export default function ReservationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      guests: 2,
    }
  });

  const onSubmit = async (data: ReservationFormValues) => {
    setIsSubmitting(true);

    try {
      // POST request to create a new reservation. 
      // tableId is omitted or passed as null since customers don't pick specific tables visually,
      // but rather the restaurant assigns one based on guests/availability.
      const res = await api.post('/reservations', {
        date: data.date,
        time: data.time,
        guests: data.guests,
        specialRequests: data.specialRequests,
      });

      if (res.data.success) {
        toast.success("Reservation request sent!");
        setSuccess(true);
        reset();
      } else {
        toast.error(res.data.message || 'Failed to request reservation');
      }
    } catch (err: unknown) {
      console.error(err);
      let message = 'Failed to make reservation. Please ensure you are logged in to reserve a table.';
      if (err instanceof AxiosError) {
        message = err.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-bottle text-basmati p-12 rounded-3xl shadow-xl border border-bottle/10">
          <div className="w-24 h-24 bg-turmeric text-bottle rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-turmeric drop-shadow-md">Request Sent!</h1>
          <p className="text-xl mb-6 opacity-90 leading-relaxed">
            Your table request is currently <strong className="text-white px-3 py-1 bg-turmeric/40 rounded-lg mx-1 shadow-sm border border-turmeric/50">PENDING approval</strong>.
          </p>
          <p className="mb-10 text-basmati/70 text-lg">
            You will receive an update once our restaurant staff confirms availability for your selected date and time.
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="px-8 py-4 bg-basmati text-bottle font-bold text-lg rounded-xl hover:bg-white transition-transform hover:-translate-y-1 shadow-lg"
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  // Calculate minimum date (today) for the native date picker
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-bottle mb-4">Reserve a Table</h1>
        <p className="text-ink/70 max-w-xl mx-auto text-lg leading-relaxed">
          Join us for an unforgettable dining experience. Book your table ahead of time to skip the wait.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-basmati p-8 md:p-10 rounded-3xl shadow-sm border border-bottle/10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          
          {/* Date Picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-ink/80 uppercase tracking-wider">Date</label>
            <input 
              type="date"
              min={today}
              {...register('date')}
              className="w-full p-4 border-2 border-bottle/10 rounded-xl focus:outline-none focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 text-ink transition-all cursor-pointer bg-basmati/30 font-medium"
            />
            {errors.date && <p className="text-chili text-sm font-medium">{errors.date.message}</p>}
          </div>

          {/* Guests */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-ink/80 uppercase tracking-wider">Number of Guests</label>
            <input 
              type="number"
              min="1"
              max="20"
              {...register('guests', { valueAsNumber: true })}
              className="w-full p-4 border-2 border-bottle/10 rounded-xl focus:outline-none focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 text-ink transition-all bg-basmati/30 font-medium"
            />
            {errors.guests && <p className="text-chili text-sm font-medium">{errors.guests.message}</p>}
          </div>
        </div>

        {/* Time Slots */}
        <div className="mb-10">
          <label className="text-sm font-bold text-ink/80 uppercase tracking-wider mb-4 block">Time Slot</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TIME_SLOTS.map(time => (
              <label key={time} className="cursor-pointer group">
                <input 
                  type="radio"
                  value={time}
                  {...register('time')}
                  className="peer hidden"
                />
                <div className="text-center py-3.5 px-2 border-2 border-bottle/10 rounded-xl peer-checked:bg-turmeric peer-checked:border-turmeric peer-checked:text-bottle peer-checked:font-bold hover:border-turmeric/50 hover:bg-turmeric/5 transition-all text-sm font-medium text-ink/80 group-active:scale-95 shadow-sm">
                  {time}
                </div>
              </label>
            ))}
          </div>
          {errors.time && <p className="text-chili text-sm font-medium mt-3">{errors.time.message}</p>}
        </div>

        {/* Special Requests */}
        <div className="mb-10">
          <label className="text-sm font-bold text-ink/80 uppercase tracking-wider mb-3 block">Special Requests (Optional)</label>
          <textarea 
            {...register('specialRequests')}
            placeholder="Anniversary, birthday celebrations, allergies, etc."
            className="w-full p-4 border-2 border-bottle/10 rounded-xl focus:outline-none focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 text-ink transition-all resize-none bg-basmati/30 font-medium"
            rows={3}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full py-5 bg-turmeric text-ink font-bold text-xl rounded-xl hover:bg-turmeric/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isSubmitting ? (
            <span className="animate-pulse tracking-wide">Requesting Table...</span>
          ) : (
            <span className="tracking-wide">Request Reservation</span>
          )}
        </button>
      </form>
    </div>
  );
}
