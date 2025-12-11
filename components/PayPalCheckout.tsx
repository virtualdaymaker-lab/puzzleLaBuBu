import React, { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase, generateActivationCodes } from '../utils/supabase';
import { PUZZLE_IMAGES } from '../constants';

interface PayPalCheckoutProps {
  onSuccess: (codes: string[]) => void;
  onCancel?: () => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);
  const [error, setError] = useState('');
  const [floatingImages, setFloatingImages] = useState<Array<{
    id: number;
    image: string;
    x: number;
    y: number;
    size: number;
    speed: number;
  }>>([]);

  // Generate floating background images
  useEffect(() => {
    const images = [];
    for (let i = 0; i < 8; i++) {
      images.push({
        id: i,
        image: PUZZLE_IMAGES[Math.floor(Math.random() * PUZZLE_IMAGES.length)].url,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 20 + Math.random() * 40, // 20-60px
        speed: 0.5 + Math.random() * 1, // 0.5-1.5
      });
    }
    setFloatingImages(images);

    // Animate floating images
    const interval = setInterval(() => {
      setFloatingImages(prev => prev.map(img => ({
        ...img,
        y: (img.y + img.speed * 0.1) % 110, // Slowly move down and wrap around
        x: img.x + Math.sin(Date.now() * 0.001 + img.id) * 0.1, // Gentle horizontal sway
      })));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setShowPayPal(true);
  };

  const isDevMode = import.meta.env.VITE_DEV_MODE === 'true';

  const handleDevPay = async () => {
    // Simulate a successful order locally without writing to Supabase
    const activationCodes = generateActivationCodes();
    onSuccess(activationCodes);
  };

  return (
    <div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
      {/* Floating background images */}
      {floatingImages.map(img => (
        <img
          key={img.id}
          src={img.image}
          alt=""
          className="absolute opacity-100 pointer-events-none"
          style={{
            left: `${img.x}%`,
            top: `${img.y}%`,
            width: `${img.size}px`,
            height: `${img.size}px`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      <div className="bg-white rounded-lg p-6 max-w-md w-full relative z-10">
        <div className="px-4 py-2 rounded-lg mb-6 text-center" style={{ backgroundColor: '#b91c1c' }}>
          <h2 className="text-xl font-black text-white tracking-wider uppercase" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            Unlock All Puzzles
          </h2>
        </div>

        {!showPayPal ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="your@email.com"
                required
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">6 Puzzles</span>
                <span className="font-bold">$20.00</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Includes 2 Limited Edition puzzles
              </p>
              <p className="text-xs text-red-600 font-semibold mt-2">
                ⚠️ Final Sale - No Refunds
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-bold text-white transition-colors"
              style={{ backgroundColor: '#b91c1c' }}
            >
              Continue to Payment
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="w-full py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </form>
        ) : (
          <PayPalScriptProvider
            options={{
              clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
              currency: 'USD',
              environment: 'sandbox', // Enable sandbox mode
            }}
          >
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Email: <span className="font-medium">{email}</span></p>
                <p className="text-sm text-gray-600">Amount: <span className="font-bold">$20.00</span></p>
              </div>

              <PayPalButtons
                style={{ layout: 'vertical' }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    purchase_units: [
                      {
                        amount: {
                          value: '20.00',
                          currency_code: 'USD',
                        },
                          description: 'Puza Labubu - 6 Puzzles (2 Limited Edition)',
                      },
                    ],
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    const order = await actions.order.capture();
                    const activationCodes = generateActivationCodes();
                    // Ensure all required fields for Supabase insert
                    const purchaseData = {
                      email: email ? email.toLowerCase() : '',
                      paypal_order_id: order.id || '',
                      activation_codes: activationCodes,
                      device_ids: [],
                      amount: 20.00,
                      status: 'completed',
                      created_at: new Date().toISOString(), // Add timestamp for Supabase
                    };
                    let supabaseError = null;
                    try {
                      const { error } = await supabase.from('purchases').insert([purchaseData]);
                      supabaseError = error;
                    } catch (err) {
                      supabaseError = err;
                    }
                    // Always show codes, even if Supabase fails
                    if (!supabaseError) {
                      onSuccess(activationCodes);
                    } else {
                      alert('Payment successful but failed to save purchase. Your activation codes are shown below. Please contact support with your PayPal order ID if you need help.');
                      onSuccess(activationCodes);
                    }
                  }
                }}
                onCancel={() => {
                  if (onCancel) onCancel();
                }}
                onError={(err) => {
                  console.error('PayPal error:', err);
                  alert('Payment failed. Please try again.');
                }}
              />

              {isDevMode && (
                <button
                  type="button"
                  onClick={handleDevPay}
                  className="w-full py-2 bg-yellow-500 rounded-lg text-black font-bold"
                >
                  Simulate Payment (DEV)
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPayPal(false)}
                className="w-full py-2 text-gray-600 hover:text-gray-800 text-sm"
              >
                ← Change Email
              </button>
            </div>
          </PayPalScriptProvider>
        )}
      </div>
    </div>
  );
};
