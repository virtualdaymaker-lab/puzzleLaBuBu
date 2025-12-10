import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { supabase, generateActivationCode } from '../utils/supabase';

interface PayPalCheckoutProps {
  onSuccess: (code: string) => void;
  onCancel?: () => void;
}

export const PayPalCheckout: React.FC<PayPalCheckoutProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('');
  const [showPayPal, setShowPayPal] = useState(false);
  const [error, setError] = useState('');

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setError('');
    setShowPayPal(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
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
                <span className="text-gray-700">5 Puzzles</span>
                <span className="font-bold">$20.00</span>
              </div>
              <p className="text-xs text-gray-600 mt-2">
                Includes 2 Limited Edition puzzles
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
                        description: 'PuzLabu - 5 Puzzles (2 Limited Edition)',
                      },
                    ],
                  });
                }}
                onApprove={async (data, actions) => {
                  if (actions.order) {
                    const order = await actions.order.capture();
                    const activationCode = generateActivationCode();
                    
                    // Save to Supabase
                    const { error } = await supabase.from('purchases').insert({
                      email: email.toLowerCase(),
                      paypal_order_id: order.id,
                      activation_code: activationCode,
                      used: false,
                      amount: 20.00,
                      status: 'completed',
                    });

                    if (!error) {
                      onSuccess(activationCode);
                    } else {
                      alert('Payment successful but failed to save. Contact support with order ID: ' + order.id);
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
