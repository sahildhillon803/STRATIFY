import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/services/api.client';

// Declare Google's global types
declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: GoogleConfig) => void;
          renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
}

interface GoogleButtonOptions {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  width?: number;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  logo_alignment?: 'left' | 'center';
}

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
}

interface GoogleAuthResponse {
  access_token: string;
  token_type: string;
  is_new_user: boolean;
  user: {
    id: string;
    email: string;
    full_name: string | null;
    profile_picture: string | null;
    oauth_provider: string | null;
  };
}

interface GoogleSignInButtonProps {
  onSuccess: (response: GoogleAuthResponse) => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}

export function GoogleSignInButton({ 
  onSuccess, 
  onError,
  text = 'continue_with' 
}: GoogleSignInButtonProps) {
  const [clientId, setClientId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Google Client ID from backend
  useEffect(() => {
    async function fetchClientId() {
      try {
        const response = await apiClient.get<{ client_id: string }>('/auth/google/client-id');
        setClientId(response.client_id);
      } catch {
        // Google OAuth not configured - hide the button
        setError('Google Sign-In not available');
      } finally {
        setIsLoading(false);
      }
    }
    fetchClientId();
  }, []);

  // Handle Google credential response
  const handleCredentialResponse = useCallback(async (response: GoogleCredentialResponse) => {
    try {
      const authResponse = await apiClient.post<GoogleAuthResponse>('/auth/google', {
        credential: response.credential,
      });
      onSuccess(authResponse);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Google authentication failed';
      setError(message);
      onError?.(message);
    }
  }, [onSuccess, onError]);

  // Initialize Google Sign-In
  useEffect(() => {
    if (!clientId) return;

    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        const buttonContainer = document.getElementById('google-signin-button');
        if (buttonContainer) {
          window.google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: text,
            shape: 'rectangular',
            logo_alignment: 'left',
          });
        }
      }
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [clientId, handleCredentialResponse, text]);

  // Don't render if Google OAuth is not configured
  if (isLoading) {
    return (
      <div className="w-full h-10 bg-gray-100 rounded-lg animate-pulse" />
    );
  }

  if (error || !clientId) {
    return null; // Hide button if Google OAuth not available
  }

  return (
    <div className="w-full">
      <div id="google-signin-button" className="flex justify-center" />
    </div>
  );
}
