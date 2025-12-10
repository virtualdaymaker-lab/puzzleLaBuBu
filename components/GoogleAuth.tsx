import React, { useEffect, useState } from 'react';
import { Button } from './Button';

interface GoogleAuthProps {
  onAuthenticated: (user: GoogleUser) => void;
}

export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
  accessToken: string;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleAuth: React.FC<GoogleAuthProps> = ({ onAuthenticated }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize Google Sign-In
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
          callback: handleCredentialResponse,
        });
        
        // Render the button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          { 
            theme: 'light', 
            size: 'large',
            text: 'signin_with'
          }
        );
        
        setLoading(false);
      }
    };
    
    document.head.appendChild(script);
  }, []);

  const handleCredentialResponse = (response: any) => {
    const token = response.credential;
    
    // Decode JWT to get user info
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const userData = JSON.parse(jsonPayload);
    
    const user: GoogleUser = {
      id: userData.sub,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
      accessToken: token,
    };
    
    // Store user data
    localStorage.setItem('puzlabu_user', JSON.stringify(user));
    localStorage.setItem('puzlabu_google_token', token);
    
    onAuthenticated(user);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="px-4 py-2 rounded-lg mb-8 text-center" style={{ backgroundColor: '#b91c1c' }}>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            PuzaLabubu
          </h1>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-800 text-center mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Welcome to PuzaLabubu
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Sign in with Google to save your progress to your account and access features across devices.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="flex justify-center">
              <div id="google-signin-button"></div>
            </div>
          )}

          <p className="text-xs text-gray-500 text-center">
            Your game progress will be saved to your account so you can sign in locally and continue where you left off.
          </p>
        </div>
      </div>
    </div>
  );
};
