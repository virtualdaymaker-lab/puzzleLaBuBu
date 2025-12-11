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




