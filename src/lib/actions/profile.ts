'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { type ActionResult } from '@/lib/supabase/types';

export async function updateProfile(fullName: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName }
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true, data: undefined };
}

export async function completeOnboarding(fullName: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return { ok: false, error: 'Not authenticated' };

  const { error } = await supabase.auth.updateUser({
    data: { 
      full_name: fullName,
      onboarding_completed: true 
    }
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/', 'layout');
  return { ok: true, data: undefined };
}
