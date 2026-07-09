'use client';

import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginFormContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', data);
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.success("Welcome back!");
        if (user?.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/');
        }
      } else {
        toast.error("Invalid email or password");
      }
    } catch (err: any) {
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-basmati p-8 md:p-10 rounded-3xl shadow-xl border border-bottle/10">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-serif font-bold text-bottle mb-2">Welcome Back</h2>
        <p className="text-ink/60">Log in to manage your bookings and orders</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm text-ink/60">
        Don't have an account?{' '}
        <Link href="/register" className="text-turmeric hover:underline font-bold">
          Register
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-10 px-4">
      <Suspense fallback={
        <div className="text-center font-serif text-bottle text-xl">Loading...</div>
      }>
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
