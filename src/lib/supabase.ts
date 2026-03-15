import { createClient } from '@supabase/supabase-js';

// Get credentials from environment variables, or use placeholders if not set.
// User will provide these in .env file (VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY).
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
