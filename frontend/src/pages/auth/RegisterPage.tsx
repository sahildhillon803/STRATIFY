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

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const { user, token } = await registerService(data.fullName, data.email, data.password);
      loginUser(user, token);
      navigate('/onboarding'); // Always go to onboarding after register
    } catch (error) {
      console.error("Registration failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create an Account</h2>
        <p className="text-sm text-gray-500 mt-1">Start your journey to startup success</p>
      </div>

      {/* Full Name Field */}
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            {...register('fullName')} 
            id="fullName" 
            type="text" 
            placeholder="John Doe"
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors" 
          />
        </div>
        {errors.fullName && <p className="text-danger text-sm mt-1">{errors.fullName.message}</p>}
      </div>

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
            className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors" 
          />
        </div>
        {errors.password && <p className="text-danger text-sm mt-1">{errors.password.message}</p>}
        <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
        {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create Account
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
        text="signup_with"
        onSuccess={(response) => {
          loginUser(
            {
              id: response.user.id,
              email: response.user.email,
              fullName: response.user.full_name || '',
              onboardingCompleted: false,
            },
            response.access_token
          );
          navigate('/onboarding');
        }}
      />

      {/* Terms */}
      <p className="text-center text-xs text-gray-400 mt-4">
        By creating an account, you agree to our{' '}
        <a href="#" className="text-primary-500 hover:underline">Terms of Service</a>
        {' '}and{' '}
        <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
      </p>

      {/* Login Link */}
      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-primary-500 hover:text-primary-600">
          Sign in
        </Link>
      </p>
    </form>
  );
}
