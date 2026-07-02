import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Public Supabase Client (For Client-Side & Standard RLS operations)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

// Admin Supabase Client (For Server-Side administrative operations that bypass RLS)
export const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })
  : null;

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase environment variables are missing. Database will run in Mock/Demo Mode.'
  );
}

export async function verifyTableExists(tableName: string): Promise<{ exists: boolean; error?: string }> {
  if (!supabaseAdmin) return { exists: false, error: 'Supabase admin client not initialized.' };
  try {
    const { error } = await supabaseAdmin.from(tableName).select('id').limit(0);
    if (error) {
      if (
        error.code === 'PGRST205' || 
        error.message.includes('Could not find the table') || 
        error.message.includes('does not exist')
      ) {
        return { exists: false, error: error.message };
      }
    }
    return { exists: true };
  } catch (err: any) {
    return { exists: false, error: err.message };
  }
}

