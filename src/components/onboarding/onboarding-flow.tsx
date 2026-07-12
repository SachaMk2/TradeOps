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

  // Step 4: Profile
  const [fullName, setFullName] = useState('');

  // Step 5: Setup
  const [setupName, setSetupName] = useState('');
  const [setupDescription, setSetupDescription] = useState('');

  // Step 6: Session
  const [sessionName, setSessionName] = useState('');

  // Step 7: Account
  const [providerName, setProviderName] = useState('');
  const [accountSize, setAccountSize] = useState('');

  async function handleNext() {
    if (step === 4 && !fullName.trim()) {
      toast.error('Veuillez entrer votre nom');
      return;
    }
    if (step === 5 && !setupName.trim()) {
      toast.error('Veuillez entrer un nom pour votre setup');
      return;
    }
    if (step === 6 && !sessionName.trim()) {
      toast.error('Veuillez entrer un nom de session');
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
      if (setupName.trim()) {
        await createSetup(setupName.trim(), setupDescription.trim() || 'Setup principal', '#3b82f6');
      }
      
      if (sessionName.trim()) {
        await createSession(sessionName.trim());
      }

      if (providerName.trim() && accountSize) {
        await createAccount({
          provider_name: providerName.trim(),
          account_size: parseFloat(accountSize) || 0,
          challenge_fee: 0,
          phase: 'eval_p1',
        });
      }
      
      const result = await completeOnboarding(fullName.trim() || 'Opérateur');
      if (result.ok) {
        toast.success('Bienvenue dans l\'élite !');
        router.refresh(); 
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0510]/95 backdrop-blur-xl">
      <div className="glass max-w-2xl w-full mx-4 rounded-3xl overflow-hidden border-primary/20 shadow-[0_0_80px_rgba(109,40,217,0.15)] animate-in fade-in zoom-in duration-500 relative">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 flex gap-1 p-4 z-10">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary shadow-[0_0_10px_rgba(109,40,217,0.8)]' : 'bg-white/10'}`} />
          ))}
        </div>

        {/* Carousel Steps */}
        <div className="p-8 pt-16">
          {/* STEP 1: Feature 1 */}
          {step === 1 && (
            <div className="space-y-6 text-center animate-in slide-in-from-right-8 duration-500">
              <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative mb-8">
                {/* Placeholder for App Screenshot */}
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="relative z-10 p-6 glass rounded-xl border-primary/30">
                  <h3 className="text-xl font-bold text-white mb-2">Dashboard Institutionnel</h3>
                  <p className="text-sm text-white/70">Toutes vos métriques en temps réel.</p>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Maîtrisez vos statistiques</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Prenez des décisions basées sur la data. Visualisez votre Win Rate, Profit Factor et R-Multiple instantanément.
              </p>
              <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg rounded-full" onClick={handleNext}>
                Suivant <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 2: Feature 2 */}
          {step === 2 && (
            <div className="space-y-6 text-center animate-in slide-in-from-right-8 duration-500">
              <div className="w-full h-64 bg-gradient-to-br from-blue-500/20 to-cyan-500/10 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative mb-8">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1642790106117-e829e14a795f?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="relative z-10 p-6 glass rounded-xl border-blue-500/30">
                  <h3 className="text-xl font-bold text-white mb-2">Journal Avancé</h3>
                  <p className="text-sm text-white/70">Tracez chaque trade avec précision.</p>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Ne laissez rien au hasard</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Enregistrez vos entrées, sorties, émotions et erreurs. Attachez des captures d'écran pour revoir vos setups.
              </p>
              <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg rounded-full" onClick={handleNext}>
                Suivant <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 3: Feature 3 */}
          {step === 3 && (
            <div className="space-y-6 text-center animate-in slide-in-from-right-8 duration-500">
              <div className="w-full h-64 bg-gradient-to-br from-emerald-500/20 to-green-500/10 rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative mb-8">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="relative z-10 p-6 glass rounded-xl border-emerald-500/30">
                  <h3 className="text-xl font-bold text-white mb-2">Calendrier de Performance</h3>
                  <p className="text-sm text-white/70">La régularité visuelle.</p>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">Bâtissez votre constance</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
                Visualisez vos jours de gain et de perte. Le calendrier transforme la rigueur en un jeu vidéo où l'objectif est de rester vert.
              </p>
              <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg rounded-full" onClick={handleNext}>
                Configurer mon profil <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 4: Profile Setup */}
          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-left py-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Identité</h2>
                <p className="text-muted-foreground text-lg">Quel est votre nom d'opérateur ?</p>
              </div>
              <div className="space-y-3">
                <Label className="text-sm uppercase tracking-wider text-muted-foreground">Nom / Pseudo</Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Ex: Sacha, TraderX..." 
                  className="bg-background/50 h-14 text-xl rounded-xl border-white/10 focus:border-primary"
                  autoFocus
                />
              </div>
              <Button size="lg" className="w-full h-14 text-lg rounded-xl" onClick={handleNext} disabled={!fullName.trim()}>
                Continuer <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 5: Setup Configuration */}
          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-left py-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Votre Stratégie</h2>
                <p className="text-muted-foreground text-lg">Définissez votre premier setup de trading.</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground">Nom du Setup</Label>
                  <Input 
                    value={setupName} 
                    onChange={(e) => setSetupName(e.target.value)} 
                    placeholder="Ex: Breakout Asiatique, SMC..." 
                    className="bg-background/50 h-12 rounded-xl"
                    autoFocus
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground">Description (Optionnel)</Label>
                  <Input 
                    value={setupDescription} 
                    onChange={(e) => setSetupDescription(e.target.value)} 
                    placeholder="Quelles sont les conditions ?" 
                    className="bg-background/50 h-12 rounded-xl"
                  />
                </div>
              </div>
              <Button size="lg" className="w-full h-14 text-lg rounded-xl" onClick={handleNext} disabled={!setupName.trim()}>
                Continuer <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 6: Session Configuration */}
          {step === 6 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-left py-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Horaires de Trading</h2>
                <p className="text-muted-foreground text-lg">Quand préférez-vous trader ?</p>
              </div>
              <div className="space-y-3">
                <Label className="text-sm uppercase tracking-wider text-muted-foreground">Nom de la Session</Label>
                <Input 
                  value={sessionName} 
                  onChange={(e) => setSessionName(e.target.value)} 
                  placeholder="Ex: London Open, New York Morning..." 
                  className="bg-background/50 h-14 text-xl rounded-xl border-white/10 focus:border-primary"
                  autoFocus
                />
              </div>
              <Button size="lg" className="w-full h-14 text-lg rounded-xl" onClick={handleNext} disabled={!sessionName.trim()}>
                Continuer <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 7: Account Setup & Finish */}
          {step === 7 && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 text-left py-8">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Premier Capital</h2>
                <p className="text-muted-foreground text-lg">Ajoutez un compte pour commencer (Optionnel).</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground">Prop Firm / Courtier</Label>
                  <Input 
                    value={providerName} 
                    onChange={(e) => setProviderName(e.target.value)} 
                    placeholder="Ex: FTMO, Topstep..." 
                    className="bg-background/50 h-12 rounded-xl"
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground">Taille du Compte ($)</Label>
                  <Input 
                    type="number"
                    value={accountSize} 
                    onChange={(e) => setAccountSize(e.target.value)} 
                    placeholder="Ex: 50000" 
                    className="bg-background/50 h-12 rounded-xl"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button size="lg" variant="ghost" className="flex-1 h-14 text-lg rounded-xl" onClick={handleFinish} disabled={loading}>
                  Passer
                </Button>
                <Button size="lg" className="flex-1 h-14 text-lg font-bold rounded-xl" onClick={handleFinish} disabled={loading}>
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (
                    <>Accéder à l'application <CheckCircle2 className="w-5 h-5 ml-2" /></>
                  )}
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
