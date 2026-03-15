import { createClient } from '@supabase/supabase-js';

// Admin client uses service_role key — bypasses RLS.
// Only used for user creation and deletion (admin-only operations).
export const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY,
);
