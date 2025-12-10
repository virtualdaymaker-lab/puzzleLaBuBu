import React, { useState } from 'react';
import { Button } from './Button';
import { MAX_DEVICES } from '../utils/supabase';

interface PaymentVerifyProps {
  onVerified: (email: string) => void;
}

export const PaymentVerify: React.FC<PaymentVerifyProps> = ({ onVerified }) => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getDeviceId = () => {
    let deviceId = localStorage.getItem('puzlabu_device_id');
    if (!deviceId) {
      deviceId = 'device_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('puzlabu_device_id', deviceId);
    }
    return deviceId;
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate email format
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    // Generate verification code and store
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    const deviceId = getDeviceId();
    
    // Store verification data (in real app, send to backend)
    localStorage.setItem('puzlabu_pending_email', email);
    localStorage.setItem('puzlabu_pending_code', code);
    localStorage.setItem('puzlabu_device_id', deviceId);
    localStorage.setItem('puzlabu_pending_timestamp', Date.now().toString());

    // Show code to user (in production, send via email)
    alert(`Verification code: ${code}\n\nIn production, this would be sent to ${email}`);
    
    setStep('verify');
    setLoading(false);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const storedCode = localStorage.getItem('puzlabu_pending_code');
    const storedEmail = localStorage.getItem('puzlabu_pending_email');
    const timestamp = parseInt(localStorage.getItem('puzlabu_pending_timestamp') || '0');
    const deviceId = getDeviceId();

    // Check if code is still valid (5 min expiry)
    if (Date.now() - timestamp > 5 * 60 * 1000) {
      setError('Code expired. Please start over.');
      setStep('email');
      localStorage.removeItem('puzlabu_pending_code');
      localStorage.removeItem('puzlabu_pending_email');
      setLoading(false);
      return;
    }

    if (verificationCode.toUpperCase() === storedCode) {
      // Store verified user
      localStorage.setItem('puzlabu_verified_email', storedEmail!);
      localStorage.setItem('puzlabu_verified_device', deviceId);
      localStorage.setItem('puzlabu_verified_timestamp', Date.now().toString());

      // Clean up temp data
      localStorage.removeItem('puzlabu_pending_code');
      localStorage.removeItem('puzlabu_pending_email');
      localStorage.removeItem('puzlabu_pending_timestamp');

      onVerified(storedEmail!);
    } else {
      setError('Invalid verification code');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="px-4 py-2 rounded-lg mb-8 text-center" style={{ backgroundColor: '#b91c1c' }}>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            PuzaLabubu
          </h1>
        </div>

        {step === 'email' ? (
          <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Verify Purchase
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Enter the email you used for payment
            </p>

            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              disabled={loading}
            />

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-800 text-center" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Enter Code
            </h2>
            <p className="text-sm text-gray-600 text-center">
              Check your email for the verification code
            </p>

            <input
              type="text"
              placeholder="XXXXXX"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 text-center tracking-widest font-bold"
              maxLength={6}
              disabled={loading}
            />

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>

            <Button 
              type="button" 
              variant="secondary" 
              fullWidth 
              onClick={() => {
                setStep('email');
                setVerificationCode('');
                setError('');
              }}
            >
              Back
            </Button>
          </form>
        )}

        <p className="text-xs text-gray-500 text-center mt-6">
          This device will be locked to your email. Each purchase allows use on up to {MAX_DEVICES} devices.
        </p>
      </div>
    </div>
  );
};
