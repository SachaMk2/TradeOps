'use server';

import { createClient, getUser } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

async function isAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await getUser();
  if (!user) return false;
  return user.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
}

export type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  is_premium: boolean;
};

export async function getAdminUsers(): Promise<{ ok: boolean; data?: AdminUser[]; error?: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Unauthorized' };
  }

  // Use service role to get all users from Auth
  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: authData, error: authError } = await adminClient.auth.admin.listUsers();
  if (authError) return { ok: false, error: authError.message };

  const { data: profiles, error: profilesError } = await adminClient
    .from('profiles')
    .select('id, is_premium');
  
  if (profilesError) return { ok: false, error: profilesError.message };

  const profileMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

  const users: AdminUser[] = authData.users.map(u => ({
    id: u.id,
    email: u.email || '',
    full_name: u.user_metadata?.full_name || 'Utilisateur',
    created_at: u.created_at,
    is_premium: profileMap.get(u.id)?.is_premium || false
  })).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return { ok: true, data: users };
}

export async function togglePremiumAccess(userId: string, isPremium: boolean): Promise<{ ok: boolean; error?: string }> {
  if (!(await isAdmin())) {
    return { ok: false, error: 'Unauthorized' };
  }

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await adminClient
    .from('profiles')
    .update({ is_premium: isPremium })
    .eq('id', userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath('/admin/users');
  return { ok: true };
}
