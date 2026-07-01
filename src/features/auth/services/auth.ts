import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: 'recruiter' | 'candidate';
  avatar_url?: string;
  created_at: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured && supabaseAdmin) {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('[AuthService] Error fetching user profile:', e);
    }
  }
  return null;
}
