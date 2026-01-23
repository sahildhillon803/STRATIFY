import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { register as registerService } from '@/services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, Mail, Lock, User } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';
import logoSvg from '@/assets/logo.svg';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login: loginUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { user, token } = await registerService(data.fullName, data.email, data.password);
      loginUser(user, token);
      navigate('/onboarding');
    } catch (error) {
      console.error('Registration failed', error);
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Registration failed. Please try again.');
      } else {
        setErrorMessage('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card">
            <img src={logoSvg} alt="Strata-AI logo" className="h-8 w-8" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-500">Strata-AI</p>
            <h2 className="text-2xl font-semibold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500">Plan, forecast, and move faster with AI.</p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full name
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('fullName')}
              id="fullName"
              type="text"
              placeholder="Jane Founder"
              className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          {errors.fullName && <p className="text-danger text-sm mt-1">{errors.fullName.message}</p>}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="you@example.com"
              className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              {...register('password')}
              id="password"
              type="password"
              placeholder="••••••••"
              className="block w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 py-2.5 text-sm placeholder-gray-400 transition-colors focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none"
            />
          </div>
          {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
          <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters.</p>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Create account
        </Button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
          <span className="bg-white px-3 text-gray-400">Or</span>
        </div>
      </div>

      <GoogleSignInButton
        text="signup_with"
        onSuccess={(response) => {
          console.log('Google signup success:', response);
          try {
            loginUser(
              {
                id: response.user.id,
                email: response.user.email,
                fullName: response.user.full_name || '',
                onboardingCompleted: false,
              },
              response.access_token
            );
            console.log('User registered, navigating to onboarding...');
            navigate('/onboarding');
          } catch (err) {
            console.error('Error in onSuccess handler:', err);
          }
        }}
        onError={(error) => {
          console.error('Google signup error:', error);
          setErrorMessage(error);
        }}
      />

      <div className="rounded-xl border border-cream-200 bg-cream-50 px-4 py-3 text-xs text-gray-500">
        By creating an account, you agree to our{' '}
        <a href="#" className="font-semibold text-primary-500 hover:text-primary-600">Terms</a> and{' '}
        <a href="#" className="font-semibold text-primary-500 hover:text-primary-600">Privacy Policy</a>.
      </div>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
