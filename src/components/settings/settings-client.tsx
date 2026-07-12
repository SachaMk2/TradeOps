'use client';

import { useState } from 'react';
import { type TradingSession } from '@/lib/supabase/types';
import { createSession, updateSession, deleteSession } from '@/lib/actions/sessions';
import { updateProfile } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Plus, Pencil, Trash2, Check, X, User, Loader2, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsClientProps {
  initialSessions: TradingSession[];
  initialFullName: string;
  isPremium: boolean;
  stripeCustomerId: string | null;
}

export function SettingsClient({ initialSessions, initialFullName, isPremium, stripeCustomerId }: SettingsClientProps) {
  const [sessions, setSessions] = useState(initialSessions);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingBilling, setIsManagingBilling] = useState(false);

  // Profile State
  const [fullName, setFullName] = useState(initialFullName);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return;
    setIsUpdatingProfile(true);
    const result = await updateProfile(fullName.trim());
    if (result.ok) {
      toast.success('Profil mis à jour');
    } else {
      toast.error(result.error);
    }
    setIsUpdatingProfile(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    const result = await createSession(newName.trim());
    if (result.ok && result.data) {
      setSessions(prev => [...prev, result.data!]);
      setNewName('');
      setIsAdding(false);
      toast.success('Session created');
    } else {
      toast.error(result.error);
    }
  }

  async function handleEdit(id: string) {
    if (!editingName.trim()) return;
    const result = await updateSession(id, editingName.trim());
    if (result.ok) {
      setSessions(prev => prev.map(s => s.id === id ? { ...s, name: editingName.trim() } : s));
      setEditingId(null);
      toast.success('Session renamed');
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(id: string) {
    const result = await deleteSession(id);
    if (result.ok) {
      setSessions(prev => prev.filter(s => s.id !== id));
      toast.success('Session deleted');
    } else {
      toast.error(result.error);
    }
  }

  async function handleManageBilling() {
    try {
      setIsManagingBilling(true);
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Impossible d'accéder au portail de facturation");
      }
    } catch (e) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsManagingBilling(false);
    }
  }

  return (
    <Tabs defaultValue="profile" className="space-y-6">
      <TabsList className="bg-background/50 border border-border/50">
        <TabsTrigger value="profile" className="gap-2"><User className="w-4 h-4" /> Profil</TabsTrigger>
        <TabsTrigger value="sessions" className="gap-2"><Clock className="w-4 h-4" /> Sessions</TabsTrigger>
        <TabsTrigger value="billing" className="gap-2"><Sparkles className="w-4 h-4" /> Abonnement</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="space-y-6">
        <div className="glass rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Informations du Profil</h2>
              <p className="text-xs text-muted-foreground">Modifier votre nom d'affichage</p>
            </div>
          </div>
          <form onSubmit={handleProfileUpdate} className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <Label>Nom / Pseudo</Label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Votre nom"
                className="bg-background/50"
              />
            </div>
            <Button type="submit" disabled={isUpdatingProfile || !fullName.trim() || fullName === initialFullName}>
              {isUpdatingProfile && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </form>
        </div>
      </TabsContent>

      <TabsContent value="sessions" className="space-y-6">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Trading Sessions</h2>
              <p className="text-xs text-muted-foreground">Customize the session names for your trades</p>
            </div>
          </div>
          {!isAdding && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-primary/30 hover:border-primary/60 hover:bg-primary/10"
              onClick={() => setIsAdding(true)}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Session
            </Button>
          )}
        </div>

        <div className="space-y-2">
          {sessions.map(session => (
            <div
              key={session.id}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-background/40 border border-border/40 hover:border-border/70 transition-all group"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              {editingId === session.id ? (
                <form
                  className="flex-1 flex items-center gap-2"
                  onSubmit={(e) => { e.preventDefault(); handleEdit(session.id); }}
                >
                  <Input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="h-7 text-sm bg-background/50 flex-1"
                    autoFocus
                  />
                  <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-profit hover:text-profit">
                    <Check className="w-3.5 h-3.5" />
                  </Button>
                  <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => setEditingId(null)}>
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </form>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium">{session.name}</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => { setEditingId(session.id); setEditingName(session.name); }}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(session.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Inline Add Row */}
          {isAdding && (
            <form
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-primary/40 bg-primary/5"
              onSubmit={handleCreate}
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Frankfurt Pre-Market"
                className="h-7 text-sm bg-background/50 flex-1"
                autoFocus
              />
              <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-profit hover:text-profit" disabled={!newName.trim()}>
                <Check className="w-3.5 h-3.5" />
              </Button>
              <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={() => { setIsAdding(false); setNewName(''); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            </form>
          )}

          {sessions.length === 0 && !isAdding && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No sessions yet. Add one above.
            </p>
          )}
        </div>
      </div>
      </TabsContent>

      <TabsContent value="billing" className="space-y-6">
        <div className="glass rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Gérer mon Abonnement</h2>
              <p className="text-xs text-muted-foreground">Consultez et modifiez votre forfait premium.</p>
            </div>
          </div>

          <div className="bg-background/40 border border-border/50 rounded-xl p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">Statut Actuel</h3>
                {isPremium ? (
                  <span className="bg-profit/10 text-profit border border-profit/20 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Premium
                  </span>
                ) : (
                  <span className="bg-muted text-muted-foreground text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                    Gratuit
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {isPremium 
                  ? 'Vous bénéficiez de l\'accès complet au Dashboard, au Journal et aux Statistiques Avancées.'
                  : 'Votre compte est limité. Passez premium pour débloquer toutes les fonctionnalités.'}
              </p>
            </div>
          </div>

          {stripeCustomerId ? (
            <div className="pt-2">
              <Button onClick={handleManageBilling} disabled={isManagingBilling} className="gap-2">
                {isManagingBilling ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                Accéder au portail de facturation
              </Button>
              <p className="text-xs text-muted-foreground mt-3">
                Gérez vos moyens de paiement, téléchargez vos factures ou résiliez votre abonnement de manière sécurisée via Stripe.
              </p>
            </div>
          ) : (
            <div className="pt-2 text-sm text-muted-foreground italic">
              Aucun abonnement Stripe détecté pour ce compte. Si vous venez de payer, l'activation peut prendre quelques instants.
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
