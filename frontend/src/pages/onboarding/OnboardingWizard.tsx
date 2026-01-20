import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { useCreateStartupProfile } from '@/hooks/useStartup';
import { useAuthStore } from '@/stores/auth.store';
import { useNavigate } from 'react-router-dom';
import { Loader2, Building2, Briefcase, DollarSign, TrendingDown, CheckCircle, ChevronRight, Users } from 'lucide-react';
import logoSvg from '@/assets/logo.svg';

const onboardingSchema = z.object({
  name: z.string().min(2, "Startup name is required"),
  industry: z.string().min(2, "Industry is required"),
  stage: z.enum(['idea', 'mvp', 'growth', 'scale']),
  team_size: z.number().min(1, "Team size must be at least 1"),
  initial_cash_balance: z.number().min(0, "Initial cash must be positive"),
  initial_monthly_expenses: z.number().min(0, "Monthly expenses must be positive"),
});
type OnboardingFormData = z.infer<typeof onboardingSchema>;

const steps = [
  { id: 1, name: 'Basics', icon: Building2 },
  { id: 2, name: 'Financials', icon: DollarSign },
  { id: 3, name: 'Finish', icon: CheckCircle },
];

export function OnboardingWizard() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { mutate: createProfile, isPending } = useCreateStartupProfile();
  const { setUser, user } = useAuthStore();

  const { register, handleSubmit, trigger, formState: { errors } } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      name: '',
      industry: '',
      stage: 'idea',
      team_size: 1,
      initial_cash_balance: 0,
      initial_monthly_expenses: 0,
    },
  });

  const handleNext = async () => {
    let isValid = false;
    if (currentStep === 1) {
      isValid = await trigger(['name', 'industry', 'stage', 'team_size']);
    } else if (currentStep === 2) {
      isValid = await trigger(['initial_cash_balance', 'initial_monthly_expenses']);
    }
    if (isValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const onSubmit = (data: OnboardingFormData) => {
    createProfile(
      {
        name: data.name,
        industry: data.industry,
        stage: data.stage,
        team_size: data.team_size,
        initial_cash_balance: data.initial_cash_balance,
        initial_monthly_expenses: data.initial_monthly_expenses,
      },
      {
        onSuccess: () => {
          // Update user state to mark onboarding as complete
          if (user) {
            setUser({ ...user, onboardingCompleted: true });
          }
          navigate('/');
        },
      }
    );
  };

  const inputClasses = "block w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 focus:outline-none transition-colors";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 p-4">
      <div className="w-full max-w-xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <img src={logoSvg} alt="Strata-AI Logo" className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Strata-AI</h1>
          <p className="text-gray-500 mt-1">Let's set up your startup profile in 3 easy steps</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                  currentStep >= step.id 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={`ml-2 text-sm font-medium hidden sm:block ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
                {index < steps.length - 1 && (
                  <ChevronRight className="h-5 w-5 text-gray-300 mx-2 sm:mx-4" />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {currentStep === 1 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className={labelClasses}>Startup Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      {...register('name')} 
                      id="name" 
                      placeholder="Acme Inc."
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  {errors.name && <p className="text-danger text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label htmlFor="industry" className={labelClasses}>Industry</label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      {...register('industry')} 
                      id="industry" 
                      placeholder="e.g., SaaS, Fintech, Healthcare"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  {errors.industry && <p className="text-danger text-sm mt-1">{errors.industry.message}</p>}
                </div>
                <div>
                  <label htmlFor="stage" className={labelClasses}>Current Stage</label>
                  <select {...register('stage')} id="stage" className={inputClasses}>
                    <option value="idea">💡 Idea Stage</option>
                    <option value="mvp">🚀 MVP Stage</option>
                    <option value="growth">📈 Growth Stage</option>
                    <option value="scale">🏢 Scale Stage</option>
                  </select>
                  {errors.stage && <p className="text-danger text-sm mt-1">{errors.stage.message}</p>}
                </div>
                <div>
                  <label htmlFor="team_size" className={labelClasses}>Team Size</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      {...register('team_size', { valueAsNumber: true })} 
                      id="team_size" 
                      type="number"
                      min={1}
                      placeholder="3"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  {errors.team_size && <p className="text-danger text-sm mt-1">{errors.team_size.message}</p>}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="initial_cash_balance" className={labelClasses}>Current Cash Balance ($)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      {...register('initial_cash_balance', { valueAsNumber: true })} 
                      id="initial_cash_balance" 
                      type="number" 
                      placeholder="500000"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  {errors.initial_cash_balance && <p className="text-danger text-sm mt-1">{errors.initial_cash_balance.message}</p>}
                </div>
                <div>
                  <label htmlFor="initial_monthly_expenses" className={labelClasses}>Average Monthly Expenses ($)</label>
                  <div className="relative">
                    <TrendingDown className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input 
                      {...register('initial_monthly_expenses', { valueAsNumber: true })} 
                      id="initial_monthly_expenses" 
                      type="number" 
                      placeholder="50000"
                      className={`${inputClasses} pl-10`}
                    />
                  </div>
                  {errors.initial_monthly_expenses && <p className="text-danger text-sm mt-1">{errors.initial_monthly_expenses.message}</p>}
                </div>
                <p className="text-xs text-gray-400">
                  This helps us calculate your runway and provide accurate insights.
                </p>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center py-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10 mb-4">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">You're all set!</h3>
                <p className="text-gray-500">Click finish to start exploring your dashboard and AI-powered insights.</p>
              </div>
            )}

            <div className="mt-8 flex justify-between pt-6 border-t border-gray-100">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleBack} 
                disabled={currentStep === 1}
              >
                Back
              </Button>
              {currentStep < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={isPending}>
                  {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                  Finish Setup
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          You can update these settings anytime from your profile.
        </p>
      </div>
    </div>
  );
}
