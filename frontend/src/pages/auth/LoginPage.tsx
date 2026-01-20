import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/auth.store';
import { login } from '@/services/auth.service';
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { Loader2, Mail, Lock } from 'lucide-react';
import { GoogleSignInButton } from '@/components/auth/GoogleSignInButton';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormData = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { login: loginUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const { user, token } = await login(data.email, data.password);
      loginUser(user, token);
      // Redirect based on onboarding status
      if (user.onboardingCompleted) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error("Login failed", error);
      if (error instanceof Error) {
        setErrorMessage(error.message || 'Login failed. Please check your credentials.');
      } else {
        setErrorMessage('Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-1">Sign in to continue to your dashboard</p>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {errorMessage}
        </div>
      )}

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            {...register('email')} 
            id="email" 
            type="email" 
            placeholder="you@example.com"
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors" 
          />
        </div>
        {errors.email && <p className="text-danger text-sm mt-1">{errors.email.message}</p>}
      </div>

      {/* Password Field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <Link to="/forgot-password" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            {...register('password')} 
            id="password" 
            type="password" 
            placeholder="••••••••"
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors" 
          />
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Sign In
      </Button>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      {/* Google Sign In */}
      <GoogleSignInButton
        text="signin_with"
        onSuccess={(response) => {
          loginUser(
            {
              id: response.user.id,
              email: response.user.email,
              fullName: response.user.full_name || '',
              onboardingCompleted: !response.is_new_user,
            },
            response.access_token
          );
          if (response.is_new_user) {
            navigate('/onboarding');
          } else {
            navigate('/');
          }
        }}
        onError={(error) => setErrorMessage(error)}
      />

      {/* Sign Up Link */}
      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="font-semibold text-primary-500 hover:text-primary-600">
          Create account
        </Link>
      </p>
    </form>
  );
}
