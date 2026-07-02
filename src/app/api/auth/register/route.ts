import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please provide all required fields' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      // Create user inside Supabase Auth
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: role || 'candidate',
        }
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Supabase handle_new_user trigger automatically copies auth user details to public.users table.
      // In case trigger didn't execute or database is syncing, let's do a backup insert and throw if it fails.
      const { error: dbError } = await supabaseAdmin
        .from('users')
        .insert({
          id: data.user.id,
          full_name: name,
          email: email,
          role: role || 'candidate',
        });
      
      if (dbError && dbError.code !== '23505') { // 23505 is unique violation (already inserted by trigger)
        throw dbError;
      }

      return NextResponse.json({
        success: true,
        user: { id: data.user.id, name, email, role: role || 'candidate' },
      });
    }

    // In-memory mock response if DB is offline
    return NextResponse.json({
      success: true,
      message: 'Registered successfully (Mock Mode)',
      user: { id: `user_${Math.random().toString(36).substring(2, 7)}`, name, email, role: role || 'candidate' },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
