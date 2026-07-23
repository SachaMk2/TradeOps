'use client';

import { useState } from 'react';
import { AdminUser, togglePremiumAccess } from '@/lib/actions/admin';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function AdminUsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleTogglePremium = async (userId: string, currentStatus: boolean) => {
    setIsLoading(userId);
    const newStatus = !currentStatus;
    
    // Optimistic update
    setUsers(users.map(u => u.id === userId ? { ...u, is_premium: newStatus } : u));
    
    try {
      const result = await togglePremiumAccess(userId, newStatus);
      if (!result.ok) throw new Error(result.error);
      
      toast.success(newStatus ? 'Accès Premium accordé' : 'Accès Premium révoqué');
    } catch (error: any) {
      // Revert on error
      setUsers(users.map(u => u.id === userId ? { ...u, is_premium: currentStatus } : u));
      toast.error(error.message || "Erreur lors de la mise à jour de l'accès");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <Card className="glass interactive-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Gestion des Utilisateurs
          </CardTitle>
          <CardDescription className="text-white/60">
            Administrez les accès premium et gérez vos élèves.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/70">
              <thead className="text-xs uppercase bg-white/5 text-white/50 border-b border-white/10">
                <tr>
                  <th scope="col" className="px-6 py-4 rounded-tl-xl">Nom Complet</th>
                  <th scope="col" className="px-6 py-4">Email</th>
                  <th scope="col" className="px-6 py-4">Date d'inscription</th>
                  <th scope="col" className="px-6 py-4 text-center rounded-tr-xl">Premium</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-white/40">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4 font-medium text-white">
                        {user.full_name}
                      </td>
                      <td className="px-6 py-4">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(new Date(user.created_at), 'dd MMM yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Switch
                            checked={user.is_premium}
                            onCheckedChange={() => handleTogglePremium(user.id, user.is_premium)}
                            disabled={isLoading === user.id}
                            className="data-[state=checked]:bg-primary"
                          />
                          <span className={`text-xs font-bold px-2 py-1 rounded-full ${user.is_premium ? 'bg-primary/20 text-primary' : 'bg-white/10 text-white/50'}`}>
                            {user.is_premium ? 'PRO' : 'FREE'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
