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

  const handleActivateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const deviceId = await getDeviceId();
      const cleanCode = code.toUpperCase().replace(/\s/g, '');

      // Find purchase with this code
      const { data: purchase, error: fetchError } = await supabase
        .from('purchases')
        .select('*')
        .eq('activation_code', cleanCode)
        .eq('status', 'completed')
        .single();

      if (fetchError || !purchase) {
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

  const handlePurchaseSuccess = (activationCode: string) => {
    setShowCheckout(false);
    setCode(activationCode);
    setShowCodeEntry(true);
  };

  if (isActivated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        <div className="px-4 py-2 rounded-lg mb-8 text-center" style={{ backgroundColor: '#b91c1c' }}>
          <h1 className="text-2xl font-black text-white tracking-wider uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            PuzLabu
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

            <button
              type="button"
              onClick={() => {
                if (code.trim() === '123') {
                  localStorage.setItem('puzlabu_activated', 'true');
                  setIsActivated(true);
                } else {
                  setError('DEV UNLOCK: Passcode is 123');
                }
              }}
              className="w-full py-2 text-green-700 hover:text-green-900 text-sm border border-green-400 rounded-lg mt-2"
            >
              DEV UNLOCK
            </button>

            <p className="text-xs text-gray-500 text-center">
              This code can be used on up to {MAX_DEVICES} devices
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

      {/* Dev-only navigation buttons (visible only in dev builds) */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
          <button
            onClick={() => {
              // Activate and navigate to menu
              localStorage.setItem('puzlabu_activated', 'true');
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
