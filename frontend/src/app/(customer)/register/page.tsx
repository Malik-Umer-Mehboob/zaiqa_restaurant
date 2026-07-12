'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { AxiosError } from 'axios';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name must be 50 characters or less'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{11}$/, 'Phone number must be exactly 11 digits'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      // Backend returns status 201 and { token, user } on successful registration
      if (response.status === 201 || response.data?.token) {
        toast.success("Account created! Please login.");
        router.push('/login');
      } else {
        toast.error("Registration failed, please try again");
      }
    } catch (err: unknown) {
      if (err instanceof AxiosError && err.response?.status === 409) {
        toast.error("This email is already registered");
      } else {
        toast.error("Registration failed, please try again");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full mx-auto bg-basmati p-8 md:p-10 rounded-3xl shadow-xl border border-bottle/10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-serif font-bold text-bottle mb-2">Create Account</h2>
          <p className="text-ink/60">Join Zaiqa to order delicious meals and book tables</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full p-4 bg-basmati/30 border-2 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-medium text-ink transition-all ${
                errors.name ? 'border-chili/50' : 'border-bottle/10'
              }`}
              placeholder="John Doe"
            />
            {errors.name && (
              <p className="mt-1.5 text-xs font-semibold text-chili">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full p-4 bg-basmati/30 border-2 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-medium text-ink transition-all ${
                errors.email ? 'border-chili/50' : 'border-bottle/10'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p className="mt-1.5 text-xs font-semibold text-chili">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Phone Number</label>
            <input
              type="tel"
              {...register('phone')}
              maxLength={11}
              inputMode="numeric"
              className={`w-full p-4 bg-basmati/30 border-2 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-medium text-ink transition-all ${
                errors.phone ? 'border-chili/50' : 'border-bottle/10'
              }`}
              placeholder="03001234567"
            />
            {errors.phone && (
              <p className="mt-1.5 text-xs font-semibold text-chili">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`w-full p-4 pr-12 bg-basmati/30 border-2 rounded-xl focus:bg-basmati focus:border-turmeric focus:ring-4 focus:ring-turmeric/10 outline-none font-medium text-ink transition-all ${
                  errors.password ? 'border-chili/50' : 'border-bottle/10'
                }`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/60 hover:text-ink transition-colors focus:outline-none cursor-pointer flex items-center"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1.5 text-xs font-semibold text-chili">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-turmeric hover:bg-turmeric/90 text-ink font-bold text-lg rounded-xl transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
          >
            {isLoading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-ink/60">
          Already have an account?{' '}
          <Link href="/login" className="text-turmeric hover:underline font-bold">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
