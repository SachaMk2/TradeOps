import { getAdminUsers } from '@/lib/actions/admin';
import { AdminUsersClient } from '@/components/admin/admin-users-client';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Admin - Utilisateurs | Rise Dash',
  description: 'Gestion des utilisateurs',
};

export default async function AdminUsersPage() {
  const { ok, data: users, error } = await getAdminUsers();

  if (!ok || !users) {
    // Si l'utilisateur n'est pas autorisé ou s'il y a une erreur
    redirect('/dashboard');
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <AdminUsersClient initialUsers={users} />
    </div>
  );
}
