import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Purchase {
  id: string;
  email: string;
  paypal_order_id: string;
  activation_code: string;
  device_ids: string[];
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  created_at: string;
}

export const MAX_DEVICES = 2;

// Generate a unique 12-character activation code
export const generateActivationCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    if (i > 0 && i % 4 === 0) code += '-';
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};
