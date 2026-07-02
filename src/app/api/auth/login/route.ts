import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Please provide email and password' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabaseAdmin) {
      // Authenticate with Supabase first
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (data?.user) {
        // Fetch user profile role from users table
        const { data: profile, error: dbError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (dbError) {
          return NextResponse.json({ error: dbError.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          user: { 
            id: data.user.id, 
            name: profile?.full_name || data.user.user_metadata?.full_name || email.split('@')[0], 
            email, 
            role: profile?.role || data.user.user_metadata?.role || 'candidate' 
          },
        });
      }
    }

    // Default accounts for easy out-of-the-box developer testing in mock fallback
    if (email === 'recruiter@domain.com' && password === 'password123') {
      return NextResponse.json({
        success: true,
        user: { id: 'recruiter_default', name: 'John Recruiter', email, role: 'recruiter' },
      });
    }

    if (email === 'candidate@example.com' && password === 'password123') {
      return NextResponse.json({
        success: true,
        user: { id: 'cand_1', name: 'Sarah Connor', email, role: 'candidate' },
      });
    }

    // Fallback Mock Mode authentication
    return NextResponse.json({
      success: true,
      message: 'Logged in successfully (Mock Mode)',
      user: { 
        id: `user_${Math.random().toString(36).substring(2, 7)}`, 
        name: email.split('@')[0], 
        email, 
        role: email.includes('recruiter') ? 'recruiter' : 'candidate' 
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
