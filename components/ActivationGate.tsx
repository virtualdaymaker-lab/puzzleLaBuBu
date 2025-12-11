/// <reference types="vite/client" />
import React, { useState, useRef } from 'react';
// TypeScript: import.meta.env types are globally declared in vite-env.d.ts
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
      const [showDemoModal, setShowDemoModal] = useState(false);
    // Purchase success handler
    const handlePurchaseSuccess = (activationCodes: string[]) => {
      setShowCheckout(false);
      setPurchasedCodes(activationCodes);
      setShowCodeEntry(true);
    };
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

  // Purchase success handler

  if (isActivated) {
    return (
      <>
        {children}
        {/* Demo Button */}
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={() => setShowDemoModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all text-lg"
            style={{ zIndex: 1000 }}
          >
            View Puzzle Demo
          </button>
        </div>
        {/* Demo Modal Popup */}
        {showDemoModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative flex flex-col items-center"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Professional Puzzle Demo</h2>
              <p className="mb-4 text-center text-gray-700">Unlock 5 high-definition puzzles. 2 are <span className="font-bold text-purple-600">Limited Edition</span>. You get <span className="font-bold">2 codes</span> for <span className="font-bold">2 devices</span>.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {PUZZLE_IMAGES.slice(0,5).map((img, idx) => (
                  <div key={img.id} className="flex flex-col items-center bg-gray-50 rounded-xl p-4 shadow-md">
                    <img src={img.url} alt={img.name} className="w-40 h-40 object-contain rounded-lg mb-2 border-2 border-gray-200" />
                    <div className="text-lg font-semibold text-gray-800 text-center mb-1">{img.name}</div>
                    <div className="text-sm text-gray-600 text-center">
                      {idx === 0 ? '⭐ Limited Edition: Unique puzzle, only available for a short time.' : ''}
                      {idx === 1 ? '⭐ Limited Edition: Special puzzle, limited access.' : ''}
                      {idx > 1 ? 'Classic puzzle challenge.' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Dev Bypass Button */}
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
      </>
    );
    // end main wrapper
  }
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

      // Special handling for test user - passcode 123 resets every time (dev only)
      const isDevMode = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_DEV_MODE === 'true';
      if (isDevMode && cleanCode === '123') {
        localStorage.removeItem('puzlabu_activated');
        localStorage.removeItem('puzlabu_device_id');
        localStorage.setItem('puzlabu_activated', 'true');
        localStorage.setItem('puzlabu_device_id', deviceId);
        setIsActivated(true);
        setLoading(false);
        return;
      }

      // DEV MODE: Allow test code 1234
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


  if (isActivated) {
    return (
      <>
        {children}
        {/* Demo Button */}
        <div className="flex justify-center items-center mt-8">
          <button
            onClick={() => setShowDemoModal(true)}
            className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all text-lg"
            style={{ zIndex: 1000 }}
          >
            View Puzzle Demo
          </button>
        </div>
        {/* Demo Modal Popup */}
        {showDemoModal && (
          <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          >
            <div
              className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full relative flex flex-col items-center"
              style={{ maxHeight: '80vh', overflowY: 'auto' }}
            >
              <button
                onClick={() => setShowDemoModal(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center">Professional Puzzle Demo</h2>
              <p className="mb-4 text-center text-gray-700">Unlock 5 high-definition puzzles. 2 are <span className="font-bold text-purple-600">Limited Edition</span>. You get <span className="font-bold">2 codes</span> for <span className="font-bold">2 devices</span>.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {PUZZLE_IMAGES.slice(0,5).map((img, idx) => (
                  <div key={img.id} className="flex flex-col items-center bg-gray-50 rounded-xl p-4 shadow-md">
                    <img src={img.url} alt={img.name} className="w-40 h-40 object-contain rounded-lg mb-2 border-2 border-gray-200" />
                    <div className="text-lg font-semibold text-gray-800 text-center mb-1">{img.name}</div>
                    <div className="text-sm text-gray-600 text-center">
                      {idx === 0 ? '⭐ Limited Edition: Unique puzzle, only available for a short time.' : ''}
                      {idx === 1 ? '⭐ Limited Edition: Special puzzle, limited access.' : ''}
                      {idx > 1 ? 'Classic puzzle challenge.' : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Dev Bypass Button */}
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
      </>
    );
    // end main wrapper
  }
  }




