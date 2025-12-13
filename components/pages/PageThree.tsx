import React, { useState } from 'react';
import MiddleScroller from '../MiddleScroller';
import { PayPalCheckout } from '../PayPalCheckout';
import { generateActivationCodes } from '../../utils/supabase';
import { getDeviceId } from '../../utils/deviceId';
import { supabase } from '../../utils/supabase';
import { sendActivationEmail } from '../../utils/sendEmail';

export const PageThree: React.FC = () => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);

  const handlePurchaseSuccess = (activationCodes: string[]) => {
    setCodes(activationCodes);
    setShowCodes(true);
  };

  const handleActivate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const deviceId = await getDeviceId();
      const cleanCode = code.toUpperCase().replace(/\s/g, '');
      const userEmail = email.trim().toLowerCase();

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
        setLoading(false);
        return;
      }
      if (deviceIds.length >= 3) {
        setError('This code has been used on too many devices already');
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
      try { await sendActivationEmail(userEmail, cleanCode); } catch {}
    } catch (err) {
      setError('Something went wrong.');
    }
    setLoading(false);
  };

  return (
    <MiddleScroller>
      <div className="w-full">
        <div className="text-center mb-2">
          <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Orbitron, sans-serif' }}>Puza Labubu — Activation & Purchase</h2>
          <p className="text-sm text-gray-600">Activate with a purchase code or buy access below.</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow border border-gray-100 w-full">
          <form onSubmit={handleActivate} className="flex flex-col gap-3">
            <label className="text-sm font-medium">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-gray-200 rounded-md p-2" placeholder="you@example.com" type="email" />
            <label className="text-sm font-medium">Activation Code</label>
            <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full border border-gray-200 rounded-md p-2" placeholder="XXXX-XXXX-XXXX" />
            {error && <div className="text-sm text-red-600">{error}</div>}
            <div className="flex gap-2 justify-end mt-2">
              <button type="button" onClick={() => { setCodes(generateActivationCodes()); setShowCodes(true); }} className="px-4 py-2 bg-gray-100 border rounded">Test Codes</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-red-600 text-white rounded-md">Activate</button>
            </div>
          </form>
        </div>

        <div className="mt-6 bg-white rounded-xl p-6 shadow border border-gray-100 w-full">
          <h4 className="font-semibold mb-2">Buy Full Set</h4>
          <p className="text-sm text-gray-600 mb-3">Enter email then continue to PayPal to purchase unlocks.</p>
          <div className="flex gap-2">
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 border border-gray-200 rounded-md p-2" placeholder="you@example.com" type="email" />
            <div style={{ width: 300 }}>
              <PayPalCheckout onSuccess={handlePurchaseSuccess} onCancel={() => {}} />
            </div>
          </div>
        </div>

        {showCodes && (
          <div className="mt-6 bg-white rounded-xl p-4 shadow border border-gray-100 w-full">
            <h4 className="font-semibold mb-2">Generated Codes</h4>
            <div className="flex flex-col gap-2">
              {codes.map((c, i) => (
                <div key={i} className="px-3 py-2 border rounded bg-gray-50 font-mono">{c}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MiddleScroller>
  );
};

export default PageThree;
