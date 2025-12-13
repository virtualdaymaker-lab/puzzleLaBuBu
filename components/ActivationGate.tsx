/// <reference types="vite/client" />
import React, { useState, useEffect } from 'react';
// TypeScript: import.meta.env types are globally declared in vite-env.d.ts
import { PUZZLE_IMAGES } from '../constants';
import { supabase, MAX_DEVICES, generateActivationCodes } from '../utils/supabase';
import { getDeviceId } from '../utils/deviceId';
import { PayPalCheckout } from './PayPalCheckout';
import { sendActivationEmail } from '../utils/sendEmail';
import axios from 'axios';

export const ActivationGate: React.FC = () => {
  const [showDemoModal, setShowDemoModal] = useState(false);
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
  const [currentLayer, setCurrentLayer] = useState<'activation'|'menu'|'puzzle'|'demo'|'checkout'|'codes'>(
    localStorage.getItem('puzlabu_activated') === 'true' ? 'menu' : 'activation'
  );

  // Dev bypass removed; navigation provided by SideNav events

  const navigateToLayer = (layer: 'activation'|'menu'|'puzzle'|'demo'|'checkout'|'codes') => {
    try {
      setCurrentLayer(layer);
      switch (layer) {
        case 'menu':
          try { (window as any).setPuzView && (window as any).setPuzView('menu'); } catch {}
          break;
        case 'puzzle':
          try { const id = PUZZLE_IMAGES[0]?.id; (window as any).setPuzView && (window as any).setPuzView('puzzle', id); } catch {}
          break;
        case 'demo':
          setShowDemoModal(true);
          break;
        case 'checkout':
          setShowCheckout(true);
          break;
        case 'codes':
          {
            const codes = generateActivationCodes();
            setPurchasedCodes(codes);
            setShowCodeEntry(true);
          }
          break;
        case 'activation':
        default:
          localStorage.removeItem('puzlabu_activated');
          localStorage.removeItem('puzlabu_device_id');
          setIsActivated(false);
          break;
      }
    } catch {}
  };

  // stepLayer removed; nav handled by SideNav events

  const handlePurchaseSuccess = (activationCodes: string[]) => {
    setShowCheckout(false);
    setPurchasedCodes(activationCodes);
    setShowCodeEntry(true);
  };

  // Dev keyboard shortcut removed

  // Quick dev bypass via URL query: ?dev=1
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      // dev url bypass removed

      // Allow opening specific UI states for full testing
      const view = params.get('view'); // 'menu' or 'puzzle'
      const puzzleId = params.get('puzzleId') || params.get('id');
      if (view === 'menu') {
        try { (window as any).setPuzView && (window as any).setPuzView('menu'); } catch {}
      } else if (view === 'puzzle') {
        try { (window as any).setPuzView && (window as any).setPuzView('puzzle', puzzleId || undefined); } catch {}
      }

      // Show demo modal directly with ?demo=1
      if (params.get('demo') === '1') setShowDemoModal(true);

      // Open checkout with ?checkout=1
      if (params.get('checkout') === '1') setShowCheckout(true);

      // Generate and show test codes ?codes=1 (uses generateActivationCodes)
      if (params.get('codes') === '1') {
        try {
          const codes = generateActivationCodes();
          setPurchasedCodes(codes);
          setShowCodeEntry(true);
        } catch (e) {}
      }
    } catch (e) {}

    // Expose a small debug API on window for interactive testing
    (window as any).puzlabuDebug = {
      setView: (v: 'menu' | 'puzzle', id?: string) => { try { (window as any).setPuzView && (window as any).setPuzView(v, id); } catch {} },
      showDemo: () => setShowDemoModal(true),
      openCheckout: () => setShowCheckout(true),
      showCodes: () => { const codes = generateActivationCodes(); setPurchasedCodes(codes); setShowCodeEntry(true); },
    };

    // Listen for nav events from SideNav (so nav works even if SideNav mounted before ActivationGate)
    const navHandler = (e: Event) => {
      try {
        const { action, view, puzzleId } = (e as CustomEvent).detail || {};
        if (!action) return;
        switch (action) {
          case 'showDemo':
            setShowDemoModal(true);
            break;
          case 'openCheckout':
            setShowCheckout(true);
            break;
          case 'showCodes':
            {
              const codes = generateActivationCodes();
              setPurchasedCodes(codes);
              setShowCodeEntry(true);
            }
            break;
          case 'devBypass':
            // devBypass removed; ignore
            break;
          case 'showActivation':
            localStorage.removeItem('puzlabu_activated');
            localStorage.removeItem('puzlabu_device_id');
            setIsActivated(false);
            break;
          case 'setView':
            try {
              (window as any).setPuzView && (window as any).setPuzView(view as 'menu' | 'puzzle', puzzleId as string | undefined);
            } catch {}
            break;
          default:
            break;
        }
      } catch {}
    };
    window.addEventListener('puzlabu-nav', navHandler as EventListener);

    return () => {
      window.removeEventListener('puzlabu-nav', navHandler as EventListener);
    };
  }, []);

  const handleGetCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    if (email.toLowerCase() === 'mhairstyle0@yahoo.com' && password === 'Newpass4123!') {
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

  const handleActivateCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const cleanCode = code.toUpperCase().replace(/\s/g, '');
      const userEmail = email.trim().toLowerCase();

      // Dev activation codes removed

      const { data: purchases, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('status', 'completed');

      if (fetchError) {
        setError('Failed to validate. Please try again.');
        setLoading(false);
        return;
      }

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
      try {
        await sendActivationEmail(userEmail, cleanCode);
      } catch {}
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  // Always render overlays (demo modal, checkout, code entry) but do not block main app content.
  return (
    <>
      {/* Activation overlay when not activated - shown as a centered modal so navigation remains available */}
      {!isActivated && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl mx-4" style={{ maxHeight: '86vh', overflow: 'auto' }}>
            <h2 className="text-2xl font-bold mb-2 text-center">Activation Required</h2>
            <p className="mb-4 text-center text-gray-700">Enter your activation code and email to unlock the full experience, or preview the demo.</p>
            <div className="hide-scrollbar overflow-y-auto" style={{ maxHeight: '60vh', padding: '8px 4px' }}>
              <div className="flex flex-col gap-6">
                <div className="bg-white rounded-xl p-4 shadow border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-full mb-4 flex items-center justify-center" style={{ minHeight: 140 }}>
                    <img src={PUZZLE_IMAGES[0]?.url} alt={PUZZLE_IMAGES[0]?.name} className="mx-auto max-h-[36vh] w-auto object-contain" />
                  </div>
                  <div className="w-full">
                    <div className="text-2xl md:text-3xl text-gray-800 font-bold mb-2 text-center tracking-widest uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>Overview</div>
                    <div className="text-sm text-gray-600 mt-1">Quick description and highlights of the puzzle set.</div>
                    <div className="mt-3">
                      <button onClick={() => setShowDemoModal(true)} className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700">Preview Demo</button>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 shadow border border-gray-100 flex flex-col items-center text-center">
                  <div className="w-full mb-4 flex items-center justify-center" style={{ minHeight: 140 }}>
                    <img src={PUZZLE_IMAGES[1]?.url} alt={PUZZLE_IMAGES[1]?.name} className="mx-auto max-h-[36vh] w-auto object-contain" />
                  </div>
                  <div className="w-full">
                    <div className="text-2xl md:text-3xl text-gray-800 font-bold mb-2 text-center tracking-widest uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>Activation</div>
                    <div className="text-sm text-gray-600 mt-1">Enter the purchase email and activation code to unlock.</div>
                    <form onSubmit={handleActivateCode} className="mt-3 w-full">
                      <label className="block text-sm font-medium text-gray-700 text-left mb-2">Email</label>
                      <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 mb-3" placeholder="you@example.com" type="email" />
                      <label className="block text-sm font-medium text-gray-700 text-left mb-2">Activation Code</label>
                      <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-gray-200 rounded-md p-2 mb-3" placeholder="XXXX-XXXX-XXXX" />
                      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
                      <div className="flex gap-2 justify-center">
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700">Activate</button>
                        <button type="button" onClick={() => setShowCheckout(true)} className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200">Buy Access</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Demo modal (visible regardless of activation state) */}
      {showDemoModal && (
        <div className="fixed inset-0 flex items-center justify-center z-60" style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-3xl w-full relative" style={{ maxHeight: '86vh' }}>
            <button onClick={() => setShowDemoModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold" aria-label="Close">×</button>
            <h2 className="text-2xl font-bold mb-2 text-center">Professional Puzzle Demo</h2>
            <p className="mb-4 text-center text-gray-700">Unlock high-definition puzzles. Scroll to preview each puzzle and tap <span className="font-bold">Try Puzzle</span> to open it.</p>

            <style>{`.hide-scrollbar::-webkit-scrollbar{display:none}.hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}`}</style>
            <div className="hide-scrollbar overflow-y-auto" style={{ maxHeight: '72vh', padding: '8px 12px' }}>
              <div className="flex flex-col gap-4">
                {PUZZLE_IMAGES.slice(0, 10).map((img, idx) => (
                  <div key={img.id} className="bg-white rounded-xl p-6 shadow border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-full mb-4 flex items-center justify-center" style={{ minHeight: 220 }}>
                      <img src={img.url} alt={img.name} className="mx-auto max-h-[56vh] w-auto object-contain" />
                    </div>
                    <div className="w-full">
                      <div className="text-xl font-semibold text-gray-800">{img.name}</div>
                      <div className="text-sm text-gray-600 mt-1 mb-3">{idx === 0 ? '⭐ Limited Edition: Unique puzzle.' : idx === 1 ? '⭐ Limited Edition: Special puzzle.' : 'Classic puzzle challenge.'}</div>
                      <div className="mt-2">
                        {img.id === 'puzalabubu' && (
                          <button onClick={() => { setShowDemoModal(false); try { (window as any).setPuzView && (window as any).setPuzView('puzzle', img.id); } catch {} }} className="px-4 py-2 bg-red-600 text-white rounded-md shadow hover:bg-red-700">Try Puzzle</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Checkout overlay */}
      {showCheckout && (
        <div style={{ zIndex: 9999, position: 'fixed', inset: 0, background: '#fff', overflowY: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ width: '100%', maxWidth: 400 }}>
            <PayPalCheckout onSuccess={handlePurchaseSuccess} onCancel={() => setShowCheckout(false)} />
          </div>
        </div>
      )}

      {/* Code entry / purchased codes panel */}
      {showCodeEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold mb-3">Your Activation Codes</h3>
            <div className="flex flex-col gap-2 mb-4">
              {purchasedCodes.map((c, i) => (
                <div key={i} className="px-3 py-2 border border-gray-100 rounded-md bg-gray-50 text-sm font-mono">{c}</div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCodeEntry(false)} className="px-4 py-2 rounded-md bg-gray-100">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};




