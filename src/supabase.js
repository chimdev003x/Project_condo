import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cbtnjdrlechkucltapjk.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_WTSfpLSJVViqpyjfz3YN_A_7H8RVRLE';

export const supabase = createClient(supabaseUrl, supabaseKey);
export const PROPERTY_BUCKET = 'property-images';
