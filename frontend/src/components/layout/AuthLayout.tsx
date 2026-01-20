import { Outlet } from 'react-router-dom';
import logoSvg from '@/assets/logo.svg';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-cream-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <img 
            src={logoSvg} 
            alt="Strata-AI Logo" 
            className="h-16 w-16 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Strata-AI</h1>
          <p className="text-gray-500 mt-1">AI-powered startup survival assistant</p>
        </div>
        
        {/* Form Card */}
        <div className="bg-white p-8 rounded-2xl shadow-card border border-gray-100">
          <Outlet />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Strata-AI. All rights reserved.
        </p>
      </div>
    </div>
  );
}
