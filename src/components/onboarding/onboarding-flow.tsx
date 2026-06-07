'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount } from '@/lib/actions/accounts';
import { createSetup } from '@/lib/actions/setups';
import { createSession } from '@/lib/actions/sessions';
import { completeOnboarding } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Profile
  const [fullName, setFullName] = useState('');

  // Step 2: Account
  const [providerName, setProviderName] = useState('');
  const [accountSize, setAccountSize] = useState('');

  // Step 3: Setup
  const [setupName, setSetupName] = useState('');

  // Step 4: Session
  const [sessionName, setSessionName] = useState('');

  async function handleNext() {
    if (step === 1 && !fullName.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }
    setStep((s) => s + 1);
  }

  async function handleSkip() {
    setStep((s) => s + 1);
  }

  async function handleFinish() {
    setLoading(true);
    try {
      // Create Account if provided
      if (providerName.trim() && accountSize) {
        await createAccount({
          provider_name: providerName.trim(),
          account_size: parseFloat(accountSize) || 0,
          challenge_fee: 0,
          phase: 'eval_p1',
        });
      }

      // Create Setup if provided
      if (setupName.trim()) {
        await createSetup(
          setupName.trim(),
          'My first setup created during onboarding',
          '#8b5cf6'
        );
      }

      // Create Session if provided
      if (sessionName.trim()) {
        await createSession(sessionName.trim());
      }

      // Finally complete onboarding
      const result = await completeOnboarding(fullName.trim());
      if (result.ok) {
        toast.success('Bienvenue dans SACH MK2 !');
        router.refresh(); // Reload to hide the modal
      } else {
        toast.error('Erreur lors de la configuration');
      }
    } catch (e) {
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="glass max-w-lg w-full mx-4 rounded-2xl p-8 border-primary/20 shadow-[0_0_50px_rgba(109,40,217,0.15)] animate-in fade-in zoom-in duration-300">
        
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(109,40,217,0.5)]' : 'bg-primary/20'}`} />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Bienvenue dans SACH MK2</h2>
              <p className="text-muted-foreground">Commençons par faire connaissance. Quel est votre nom ou pseudo de trader ?</p>
            </div>
            <div className="space-y-2">
              <Label>Nom d'opérateur</Label>
              <Input 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                placeholder="Ex: Sacha, TraderX..." 
                className="bg-background/50 h-12 text-lg"
                autoFocus
              />
            </div>
            <Button className="w-full h-12 text-lg font-bold" onClick={handleNext} disabled={!fullName.trim()}>
              Continuer <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Votre Premier Compte</h2>
              <p className="text-muted-foreground">Ajoutez un compte Prop Firm ou Personnel pour commencer à trader.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du Compte / Prop Firm</Label>
                <Input 
                  value={providerName} 
                  onChange={(e) => setProviderName(e.target.value)} 
                  placeholder="Ex: FTMO, Compte Personnel..." 
                  className="bg-background/50"
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label>Taille du Compte ($)</Label>
                <Input 
                  type="number"
                  value={accountSize} 
                  onChange={(e) => setAccountSize(e.target.value)} 
                  placeholder="Ex: 100000" 
                  className="bg-background/50"
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={handleSkip}>Ignorer</Button>
              <Button className="flex-1" onClick={handleNext}>Continuer <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Votre Setup Favori</h2>
              <p className="text-muted-foreground">Les setups vous permettent de catégoriser vos trades (ex: Breakout, Rejet...).</p>
            </div>
            <div className="space-y-2">
              <Label>Nom du Setup</Label>
              <Input 
                value={setupName} 
                onChange={(e) => setSetupName(e.target.value)} 
                placeholder="Ex: Breakout Retest" 
                className="bg-background/50"
                autoFocus
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" className="flex-1" onClick={handleSkip}>Ignorer</Button>
              <Button className="flex-1" onClick={handleNext}>Continuer <ArrowRight className="w-4 h-4 ml-2" /></Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Session de Trading</h2>
              <p className="text-muted-foreground">Définissez votre session de trading principale pour filtrer vos statistiques.</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom de la Session</Label>
                <Input 
                  value={sessionName} 
                  onChange={(e) => setSessionName(e.target.value)} 
                  placeholder="Ex: London Session" 
                  className="bg-background/50"
                  autoFocus
                />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setStep(3)}>Retour</Button>
              <Button className="flex-1 font-bold" onClick={handleFinish} disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                  <>Terminer l'Onboarding <CheckCircle2 className="w-5 h-5 ml-2" /></>
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
