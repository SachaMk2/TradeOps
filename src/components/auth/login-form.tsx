'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signUpWithEmail } from '@/lib/actions/auth';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function LoginForm({ initialMode = 'signin' }: { initialMode?: 'signin' | 'signup' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (mode === 'signup') {
      const result = await signUpWithEmail(email, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess('Compte créé ! Veuillez vous connecter pour continuer.');
      setMode('signin');
      return;
    }

    const result = await signInWithEmail(email, password);
    setLoading(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push('/');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm text-muted-foreground">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="trader@risedash.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-background/50 border-border/50 focus:border-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm text-muted-foreground">
          Mot de passe
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="bg-background/50 border-border/50 focus:border-primary"
        />
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2 border border-destructive/20">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-profit bg-profit/10 rounded-lg px-3 py-2 border border-profit/20">
          {success}
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        {loading
          ? (mode === 'signin' ? 'Connexion en cours...' : 'Création du compte...')
          : (mode === 'signin' ? 'Se connecter' : 'Créer un compte')}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError('');
            setSuccess('');
          }}
          className="text-sm text-muted-foreground hover:text-primary transition-colors"
        >
          {mode === 'signin'
            ? "Pas encore de compte ? S'inscrire"
            : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </form>
  );
}
