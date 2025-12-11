import React, { useState, useRef } from 'react';
import { PUZZLE_IMAGES } from '../constants';
import { supabase, MAX_DEVICES, generateActivationCodes } from '../utils/supabase';
import { getDeviceId } from '../utils/deviceId';
import { PayPalCheckout } from './PayPalCheckout';
import { sendActivationEmail } from '../utils/sendEmail';
import axios from 'axios';

interface ActivationGateProps {
  children: React.ReactNode;
}

export const ActivationGate: React.FC<ActivationGateProps> = ({ children }) => {
  const [isActivated, setIsActivated] = useState(
    localStorage.getItem('puzlabu_activated') === 'true'
  );
  const [showCheckout, setShowCheckout] = useState(false);
  const [showCodeEntry, setShowCodeEntry] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [purchasedCodes, setPurchasedCodes] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showDemo, setShowDemo] = useState(false);

  // Dev bypass functionality
  const handleDevBypass = () => {
    localStorage.setItem('puzlabu_activated', 'true');
    setIsActivated(true);
  };

  // Keyboard shortcut for dev bypass (Ctrl+Shift+B)
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'B') {
        handleDevBypass();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Sound effects
  const playSound = (soundType: 'swoosh' | 'ting') => {
    try {
      // Create audio context for sound effects
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (soundType === 'swoosh') {
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
      } else if (soundType === 'ting') {
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      }
    } catch (e) {
      // Silently fail if Web Audio API is not supported
    }
  };

  const handleGetCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (email.toLowerCase() === 'mhairstyle0@yahoo.com' && password === 'Newpass4123!') {
      // Generate codes for testing
      const activationCodes = generateActivationCodes();
      setPurchasedCodes(activationCodes);
      setShowCodeEntry(true);
      setLoading(false);
      return;
    } else {
      setError('Invalid credentials');
      setLoading(false);
    }
  };

  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const cleanCode = code.toUpperCase().replace(/\s/g, '');
      const userEmail = email.trim().toLowerCase();

      // Special handling for test user - passcode 123 resets every time
      if (cleanCode === '123') {
        localStorage.removeItem('puzlabu_activated');
        localStorage.removeItem('puzlabu_device_id');
        localStorage.setItem('puzlabu_activated', 'true');
        localStorage.setItem('puzlabu_device_id', deviceId);
        setIsActivated(true);
        setLoading(false);
        return;
      }

      // DEV MODE: Allow test code 1234
      const isDevMode = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEV_MODE === 'true';
      if (isDevMode && cleanCode === '1234') {
        localStorage.setItem('puzlabu_activated', 'true');
        localStorage.setItem('puzlabu_device_id', deviceId);
        setIsActivated(true);
        setLoading(false);
        return;
      }

      const { data: purchases, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'completed');

      if (fetchError) {
        setError('Failed to validate. Please try again.');
        setLoading(false);
        return;
      }

      // Find purchase by code and email
      const purchase = purchases?.find((p: any) =>
        p.activation_codes && p.activation_codes.includes(cleanCode) &&
        p.email && p.email.trim().toLowerCase() === userEmail
      );

      if (!purchase) {
        setError('Activation code and email do not match any purchase.');
        setLoading(false);
        return;
      }

      const deviceIds = purchase.device_ids || [];
      if (deviceIds.includes(deviceId)) {
        localStorage.setItem('puzlabu_activated', 'true');
        localStorage.setItem('puzlabu_device_id', deviceId);
        setIsActivated(true);
        setLoading(false);
        return;
      }
      if (deviceIds.length >= MAX_DEVICES) {
        setError(`This code has been used on ${MAX_DEVICES} devices already`);
        setLoading(false);
        return;
      }
      const { error: updateError } = await supabase
        .from('purchases')
        .update({ device_ids: [...deviceIds, deviceId] })
        .eq('id', purchase.id);
      if (updateError) {
        setError('Failed to activate. Please try again.');
        setLoading(false);
        return;
      }
      localStorage.setItem('puzlabu_activated', 'true');
      localStorage.setItem('puzlabu_device_id', deviceId);
      setIsActivated(true);
      // Send confirmation email
      try {
        await sendActivationEmail(userEmail, cleanCode);
      } catch {}
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  const handlePurchaseSuccess = (activationCodes: string[]) => {
    setShowCheckout(false);
    setPurchasedCodes(activationCodes);
    setShowCodeEntry(true);
  };

  if (isActivated) {
    return <>{children}</>;
  }
  // Show login/activation UI until activated
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md relative z-20">
        <div className="px-4 py-2 rounded-lg mb-8 text-center relative" style={{ backgroundColor: '#b91c1c' }}>
          <h1 className="text-2xl font-black text-white tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Puza Labubu
          </h1>
        </div>
        {showDemo && (
          <div className="mb-6 bg-white p-4 rounded-lg border border-transparent">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">All 6 Puzzles</h3>
              <p className="text-sm text-gray-600">Including 2 Limited Editions</p>
            </div>
            <div className="grid grid-cols-3 gap-3" style={{ background: '#fff', zIndex: 1 }}>
              {PUZZLE_IMAGES.map(puzzle => (
                <div key={puzzle.id} className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-2 rounded-lg border-2 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: puzzle.bgColor, borderColor: puzzle.color === 'purple' ? '#8b5cf6' : puzzle.color === 'red' ? '#ef4444' : puzzle.color === 'amber' ? '#f59e0b' : puzzle.color === 'yellow' ? '#eab308' : '#6b7280' }}
                  >
                    <img src={puzzle.url} alt={puzzle.name} className="w-full h-full object-cover" style={{ opacity: 1 }} />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{puzzle.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {!showCodeEntry ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Unlock All 6 Puzzles
              </h2>
              <p className="text-sm text-gray-600">
                Get 5 exclusive Labubu puzzles including 2 limited editions
              </p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg relative z-10">
              <div className="text-center mb-4">
                {/* Price is set via VITE_PUZZLE_PRICE in .env.local */}
                <span className="text-4xl font-black" style={{ color: '#b91c1c' }}>${import.meta.env.VITE_PUZZLE_PRICE}</span>
                <p className="text-xs text-gray-500 mt-2">One-time payment • Works on {MAX_DEVICES} devices</p>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105 mb-3"
                style={{ backgroundColor: '#b91c1c' }}
              >
                Buy Now
              </button>
              <button
                onClick={() => setShowCodeEntry(true)}
                className="w-full py-2 text-blue-600 hover:text-blue-800 text-sm border border-blue-200 rounded mb-1"
                style={{ backgroundColor: '#f0f9ff' }}
              >
                Enter Code / Unlock All
              </button>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Have a code? Buy first to get one!
              </button>
            </div>
          </div>
        ) : purchasedCodes.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Your Activation Codes
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Each code unlocks the puzzles on up to 2 devices
              </p>
            </div>
            <div className="space-y-3">
              {purchasedCodes.map((purchasedCode, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Code {idx + 1}</p>
                  <p className="text-lg font-mono font-bold text-center tracking-widest text-gray-800 select-all">
                    {purchasedCode}
                  </p>
                  <button
                    className="mt-2 w-full py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600"
                    onClick={async () => {
                      const userEmail = email || window.prompt('Enter your email to send code:', email);
                      if (!userEmail || !userEmail.includes('@')) {
                        alert('Please enter a valid email address.');
                        return;
                      }
                      // Send activation code via backend API
                      try {
                        const result = await axios.post('/api/send-activation-email', {
                          to: userEmail,
                          code: purchasedCode,
                        });
                        if (result.data && result.data.success) {
                          alert(`Code sent to ${userEmail} with instructions.\n\nNo refunds. Each code works on 2 devices only.`);
                        } else {
                          alert(`Failed to send email: ${result.data.error || 'Unknown error'}`);
                        }
                      } catch (err) {
                        alert(`Failed to send email: ${err.message}`);
                      }
                    }}
                  >
                    Send to Email
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-xs font-bold text-red-700 mb-1">⚠️ FINAL SALE</p>
              <p className="text-xs text-red-600">
                All sales are final. No refunds. Each code works on 2 devices only.
              </p>
            </div>
            <button
              onClick={() => {
                setShowCodeEntry(true);
                setPurchasedCodes([]);
                setCode('');
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              I have a code
            </button>
            <button
              onClick={() => {
                setShowCodeEntry(true);
                setCode(purchasedCodes[0] || '');
                setPurchasedCodes([]);
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
              style={{ backgroundColor: '#b91c1c' }}
            >
              Activate Now
            </button>
            <p className="text-xs text-gray-500 text-center">
              Save these codes for your records
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Enter Activation Code
              </h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 mb-2">Test Mode: Get codes by email</p>
              <form onSubmit={handleGetCodes} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Email address"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Password"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Getting codes...' : 'Get Test Codes'}
                </button>
              </form>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or enter code manually</span>
              </div>
            </div>
            <form onSubmit={handleActivateCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activation Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center uppercase tracking-wider font-mono text-lg"
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Used for Purchase
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg"
                  placeholder="your@email.com"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: '#b91c1c' }}
              >
                {loading ? 'Activating...' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCodeEntry(false);
                  setCode('');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back
              </button>
              <p className="text-xs text-gray-500 text-center">
                Each code can be used on up to {MAX_DEVICES} devices
              </p>
            </form>
          </div>
        )}
        {showCheckout && (
          <div
            style={{
              zIndex: 9999,
              position: 'fixed',
              inset: 0,
              background: '#fff',
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem',
            }}
          >
            <div style={{ width: '100%', maxWidth: 400 }}>
              <PayPalCheckout
                onSuccess={handlePurchaseSuccess}
                onCancel={() => setShowCheckout(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md relative z-20">
        <div className="px-4 py-2 rounded-lg mb-8 text-center relative" style={{ backgroundColor: '#b91c1c' }}>
          <h1 className="text-2xl font-black text-white tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Puza Labubu
          </h1>
          <button
            onClick={() => {
              setShowDemo(!showDemo);
              playSound('swoosh');
            }}
            className="absolute top-2 right-2 px-2 py-1 bg-white/20 text-white text-xs rounded hover:bg-white/30 transition"
          >
            {showDemo ? '✕' : '👁️ VIEW'}
          </button>
        </div>

        {showDemo && (
          <div className="mb-6 bg-white p-4 rounded-lg border border-transparent">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-gray-800 mb-2">All 6 Puzzles</h3>
              <p className="text-sm text-gray-600">Including 2 Limited Editions</p>
            </div>

            <div className="grid grid-cols-3 gap-3" style={{ background: '#fff', zIndex: 1 }}>
              {PUZZLE_IMAGES.map(puzzle => (
                <div key={puzzle.id} className="text-center">
                  <div
                    className="w-16 h-16 mx-auto mb-2 rounded-lg border-2 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: puzzle.bgColor, borderColor: puzzle.color === 'purple' ? '#8b5cf6' : puzzle.color === 'red' ? '#ef4444' : puzzle.color === 'amber' ? '#f59e0b' : puzzle.color === 'yellow' ? '#eab308' : '#6b7280' }}
                  >
                    <img src={puzzle.url} alt={puzzle.name} className="w-full h-full object-cover" style={{ opacity: 1 }} />
                  </div>
                  <p className="text-xs font-medium text-gray-700">{puzzle.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!showCodeEntry ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Unlock All 6 Puzzles
              </h2>
              <p className="text-sm text-gray-600">
                Get 5 exclusive Labubu puzzles including 2 limited editions
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg relative z-10">
              <div className="text-center mb-4">
                {/* Price is set via VITE_PUZZLE_PRICE in .env.local */}
                <span className="text-4xl font-black" style={{ color: '#b91c1c' }}>${import.meta.env.VITE_PUZZLE_PRICE}</span>
                <p className="text-xs text-gray-500 mt-2">One-time payment • Works on {MAX_DEVICES} devices</p>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105 mb-3"
                style={{ backgroundColor: '#b91c1c' }}
              >
                Buy Now
              </button>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Have a code? Buy first to get one!
              </button>
            </div>
          </div>
        ) : purchasedCodes.length > 0 ? (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Your Activation Codes
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Each code unlocks the puzzles on up to 2 devices
              </p>
            </div>


            <div className="space-y-3">
              {purchasedCodes.map((purchasedCode, idx) => (
                <div key={idx} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Code {idx + 1}</p>
                  <p className="text-lg font-mono font-bold text-center tracking-widest text-gray-800 select-all">
                    {purchasedCode}
                  </p>
                  <button
                    className="mt-2 w-full py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600"
                    onClick={async () => {
                      const userEmail = email || window.prompt('Enter your email to send code:', email);
                      if (!userEmail || !userEmail.includes('@')) {
                        alert('Please enter a valid email address.');
                        return;
                      }
                      // Send activation code via backend API
                      try {
                        const result = await axios.post('/api/send-activation-email', {
                          to: userEmail,
                          code: purchasedCode,
                        });
                        if (result.data && result.data.success) {
                          alert(`Code sent to ${userEmail} with instructions.\n\nNo refunds. Each code works on 2 devices only.`);
                        } else {
                          alert(`Failed to send email: ${result.data.error || 'Unknown error'}`);
                        }
                      } catch (err) {
                        alert(`Failed to send email: ${err.message}`);
                      }
                    }}
                  >
                    Send to Email
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <p className="text-xs font-bold text-red-700 mb-1">⚠️ FINAL SALE</p>
              <p className="text-xs text-red-600">
                All sales are final. No refunds. Each code works on 2 devices only.
              </p>
            </div>

            <button
              onClick={() => {
                setShowCodeEntry(true);
                setPurchasedCodes([]);
                setCode('');
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              I have a code
            </button>
            <button
              onClick={() => {
                setShowCodeEntry(true);
                setCode(purchasedCodes[0] || '');
                setPurchasedCodes([]);
                setError('');
                setEmail('');
                setPassword('');
              }}
              className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
              style={{ backgroundColor: '#b91c1c' }}
            >
              Activate Now
            </button>
            <p className="text-xs text-gray-500 text-center">
              Save these codes for your records
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Enter Activation Code
              </h2>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-700 mb-2">Test Mode: Get codes by email</p>
              <form onSubmit={handleGetCodes} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Email address"
                  required
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                  placeholder="Password"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 bg-blue-500 text-white rounded text-sm font-bold hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Getting codes...' : 'Get Test Codes'}
                </button>
              </form>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or enter code manually</span>
              </div>
            </div>
            <form onSubmit={handleActivateCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activation Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center uppercase tracking-wider font-mono text-lg"
                  placeholder="XXXX-XXXX-XXXX"
                  maxLength={14}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Used for Purchase
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg"
                  placeholder="your@email.com"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-lg font-bold text-white transition-all hover:scale-105 disabled:opacity-50"
                style={{ backgroundColor: '#b91c1c' }}
              >
                {loading ? 'Activating...' : 'Activate'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCodeEntry(false);
                  setCode('');
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Back
              </button>
              <p className="text-xs text-gray-500 text-center">
                Each code can be used on up to {MAX_DEVICES} devices
              </p>
            </form>
          </div>
        )}
      </div>

      {/* Dev bypass button - small and subtle */}
      <div className="fixed bottom-2 right-2 z-50">
        <button
          onClick={handleDevBypass}
          className="w-8 h-8 bg-gray-400 hover:bg-gray-500 text-white text-xs rounded-full opacity-30 hover:opacity-100 transition-opacity flex items-center justify-center"
          title="Dev: Bypass to Puzzles (Ctrl+Shift+B)"
        >
          →
        </button>
      </div>

      {showCheckout && (
        <div
          style={{
            zIndex: 9999,
            position: 'fixed',
            inset: 0,
            background: '#fff',
            overflowY: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ width: '100%', maxWidth: 400 }}>
            <PayPalCheckout
              onSuccess={handlePurchaseSuccess}
              onCancel={() => setShowCheckout(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
