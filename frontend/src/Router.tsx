import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';

// Layouts - Load immediately (needed for all routes)
import { MainLayout } from '@/components/layout/MainLayout';
import { AuthLayout } from '@/components/layout/AuthLayout';

// Wrappers & Error - Load immediately
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { ErrorPage } from '@/pages/ErrorPage';

// Loading component for lazy-loaded pages
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
);

// Lazy load pages for code splitting
const SmartOnboarding = lazy(() => 
  import('@/pages/onboarding/SmartOnboarding').then(m => ({ default: m.SmartOnboarding }))
);
const DashboardPage = lazy(() => 
  import('@/pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage }))
);
const ScenariosPage = lazy(() => 
  import('@/pages/scenarios/ScenariosPage').then(m => ({ default: m.ScenariosPage }))
);
const ScenarioDetailPage = lazy(() => 
  import('@/pages/scenarios/ScenarioDetailPage').then(m => ({ default: m.ScenarioDetailPage }))
);
const IdeationPage = lazy(() => 
  import('@/pages/ideation/IdeationPage').then(m => ({ default: m.IdeationPage }))
);
const RoadmapsPage = lazy(() => 
  import('@/pages/roadmaps/RoadmapsPage').then(m => ({ default: m.RoadmapsPage }))
);
const RoadmapDetailPage = lazy(() => 
  import('@/pages/roadmaps/RoadmapDetailPage').then(m => ({ default: m.RoadmapDetailPage }))
);
const SettingsPage = lazy(() => 
  import('@/pages/settings/SettingsPage').then(m => ({ default: m.SettingsPage }))
);
// --- ADDED INVESTOR DIRECTORY LAZY LOAD ---
const InvestorDirectoryPage = lazy(() => 
  import('@/pages/dashboard/InvestorDirectoryPage').then(m => ({ default: m.InvestorDirectoryPage }))
);

const LoginPage = lazy(() => 
  import('@/pages/auth/LoginPage').then(m => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() => 
  import('@/pages/auth/RegisterPage').then(m => ({ default: m.RegisterPage }))
);
const ForgotPasswordPage = lazy(() => 
  import('@/pages/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage }))
);
const ResetPasswordPage = lazy(() => 
  import('@/pages/auth/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage }))
);

// Wrap lazy components with Suspense
const withSuspense = (Component: React.LazyExoticComponent<React.ComponentType>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'login', element: withSuspense(LoginPage) },
      { path: 'register', element: withSuspense(RegisterPage) },
      { path: 'forgot-password', element: withSuspense(ForgotPasswordPage) },
      { path: 'reset-password', element: withSuspense(ResetPasswordPage) },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'onboarding',
        element: withSuspense(SmartOnboarding),
      },
      {
        element: <MainLayout />,
        children: [
          { path: 'dashboard', element: withSuspense(DashboardPage) },
          { path: 'scenarios', element: withSuspense(ScenariosPage) },
          { path: 'scenarios/:id', element: withSuspense(ScenarioDetailPage) },
          { path: 'ideation', element: withSuspense(IdeationPage) },
          { path: 'roadmaps', element: withSuspense(RoadmapsPage) },
          { path: 'roadmaps/:id', element: withSuspense(RoadmapDetailPage) },
          { path: 'settings', element: withSuspense(SettingsPage) },
          // --- ADDED INVESTOR DIRECTORY ROUTE HERE ---
          { path: 'investors', element: withSuspense(InvestorDirectoryPage) },
        ],
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}