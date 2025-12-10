import React, { useState } from 'react';
import { PUZZLE_IMAGES } from '../constants';
import { supabase, MAX_DEVICES } from '../utils/supabase';
import { getDeviceId } from '../utils/deviceId';
import { PayPalCheckout } from './PayPalCheckout';

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

  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deviceId = await getDeviceId();
      const cleanCode = code.toUpperCase().replace(/\s/g, '');

      // DEV MODE: Allow test code 1234
      if (isDevMode && cleanCode === '1234') {
        localStorage.setItem('puzlabu_activated', 'true');
        localStorage.setItem('puzlabu_device_id', deviceId);
        setIsActivated(true);
        setLoading(false);
        return;
      }

      // Find purchase with this code (search in activation_codes array)
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
        p.activation_codes && p.activation_codes.includes(cleanCode)
      );

      if (!purchase) {
        setError('Invalid activation code');
        setLoading(false);
        return;
      }

      const deviceIds = purchase.device_ids || [];

      // Check if device already activated
      if (deviceIds.includes(deviceId)) {
        localStorage.setItem('puzlabu_activated', 'true');
        localStorage.setItem('puzlabu_device_id', deviceId);
        setIsActivated(true);
        setLoading(false);
        return;
      }

      // Check device limit
      if (deviceIds.length >= MAX_DEVICES) {
        setError(`This code has been used on ${MAX_DEVICES} devices already`);
        setLoading(false);
        return;
      }

      // Add device
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

  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  const handleDevSkip = () => {
    if (isDevMode) {
      localStorage.setItem('puzlabu_activated', 'true');
      setIsActivated(true);
    }
  };

  if (isActivated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      {isDevMode && !isActivated && (
        <div className="absolute top-4 left-4">
          <button
            onClick={handleDevSkip}
            className="px-4 py-2 rounded-lg text-xs bg-blue-500 text-white font-bold hover:bg-blue-600 transition"
          >
            Bypass Activation (DEV)
          </button>
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="px-4 py-2 rounded-lg mb-8 text-center" style={{ backgroundColor: '#b91c1c' }}>
          <h1 className="text-2xl font-black text-white tracking-wider" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Puza Labubu
          </h1>
        </div>

        {!showCodeEntry ? (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                Unlock All 5 Puzzles
              </h2>
              <p className="text-sm text-gray-600">
                Get 5 exclusive Labubu puzzles including 2 limited editions
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="text-center mb-4">
                <span className="text-4xl font-black" style={{ color: '#b91c1c' }}>$20</span>
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
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                Already have a code?
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
                setCode(purchasedCodes[0]);
                setShowCodeEntry(false);
                setPurchasedCodes([]);
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
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>

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
              }}
              className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back
            </button>

            <p className="text-xs text-gray-500 text-center">
              Each code can be used on up to {MAX_DEVICES} devices
            </p>
          </form>
        )}
      </div>

      {showCheckout && (
        <PayPalCheckout
          onSuccess={handlePurchaseSuccess}
          onCancel={() => setShowCheckout(false)}
        />
      )}

      {isDevMode && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-2">
          <button
            onClick={handleDevSkip}
            className="px-3 py-2 rounded-lg text-xs bg-green-400 text-black font-bold hover:bg-green-500"
          >
            DEV: Skip Activation
          </button>
          {!isActivated && (
            <button
              onClick={handleDevSkip}
              className="px-4 py-2 rounded-lg text-xs bg-blue-500 text-white font-bold hover:bg-blue-600 transition"
            >
              Bypass Activation
            </button>
          )}
        </div>
      )}

      {/* Dev-only navigation buttons (visible only in dev builds) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
          <button
            onClick={() => {
              // Activate and navigate to menu
              localStorage.setItem('puzlabu_activated', 'true');
              setIsActivated(true);
              localStorage.setItem('puzlabu_dev_nav', 'menu');
              // Notify App to handle dev nav
              window.dispatchEvent(new Event('puzlabu:dev-nav'));
            }}
            className="bg-gray-800 text-white px-3 py-2 rounded shadow"
            title="DEV: Open Menu"
          >
            DEV: Menu
          </button>

          <button
            onClick={() => {
              // Activate and open first puzzle
              localStorage.setItem('puzlabu_activated', 'true');
              setIsActivated(true);
              const firstPuzzle = (PUZZLE_IMAGES && PUZZLE_IMAGES[0]) ? PUZZLE_IMAGES[0].id : 'lpbb1';
              localStorage.setItem('puzlabu_dev_nav', `puzzle:${firstPuzzle}`);
              window.dispatchEvent(new Event('puzlabu:dev-nav'));
            }}
            className="bg-gray-800 text-white px-3 py-2 rounded shadow"
            title="DEV: Open First Puzzle"
          >
            DEV: Puzzle 1
          </button>

          <button
            onClick={() => {
              // Activate only
              localStorage.setItem('puzlabu_activated', 'true');
              setIsActivated(true);
              window.dispatchEvent(new Event('puzlabu:dev-nav'));
            }}
            className="bg-green-600 text-white px-3 py-2 rounded shadow"
            title="DEV: Activate"
          >
            DEV: Activate
          </button>
        </div>
      )}
    </div>
  );
};
