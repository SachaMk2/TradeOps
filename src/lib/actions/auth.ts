'use server';

import { isDevBypass } from '@/lib/mock/bypass';
import { type ActionResult } from '@/lib/supabase/types';

export async function signInWithEmail(
  email: string,
  password: string
): Promise<ActionResult> {
  if (isDevBypass()) {
    return { ok: true, data: undefined };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  
  const { redirect } = await import('next/navigation');
  redirect('/dashboard');
  return { ok: true, data: undefined };
}

export async function signUpWithEmail(
  email: string,
  password: string
): Promise<ActionResult> {
  if (isDevBypass()) {
    return { ok: true, data: undefined };
  }

  const { createClient } = await import('@/lib/supabase/server');
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true, data: undefined };
}

export async function signOut(): Promise<void> {
  if (isDevBypass()) return;

  const { createClient } = await import('@/lib/supabase/server');
  const { redirect } = await import('next/navigation');
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}
