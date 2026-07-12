'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAccount } from '@/lib/actions/accounts';
import { createSetup, addChecklistItem } from '@/lib/actions/setups';
import { createSession } from '@/lib/actions/sessions';
import { completeOnboarding } from '@/lib/actions/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowRight, CheckCircle2, BarChart3, BookOpen, Calendar as CalendarIcon, Plus, X } from 'lucide-react';
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
  const [setupRules, setSetupRules] = useState<string[]>([]);
  const [newRule, setNewRule] = useState('');

  // Step 6: Session
  const [sessionName, setSessionName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Step 7: Account
  const [providerName, setProviderName] = useState('');
  const [accountSize, setAccountSize] = useState('');

  function handleAddRule() {
    if (newRule.trim()) {
      setSetupRules([...setupRules, newRule.trim()]);
      setNewRule('');
    }
  }

  function handleRemoveRule(index: number) {
    setSetupRules(setupRules.filter((_, i) => i !== index));
  }

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

  async function handleFinish() {
    setLoading(true);
    try {
      if (setupName.trim()) {
        const setupResult = await createSetup(setupName.trim(), setupDescription.trim() || 'Setup principal', '#3b82f6');
        if (setupResult.ok && setupResult.data && setupRules.length > 0) {
          for (let i = 0; i < setupRules.length; i++) {
            await addChecklistItem(setupResult.data.id, setupRules[i], i);
          }
        }
      }
      
      if (sessionName.trim()) {
        await createSession(
          sessionName.trim(), 
          startTime || null, 
          endTime || null
        );
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
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B0510]/95 backdrop-blur-2xl">
      <div className="glass max-w-2xl w-full mx-4 rounded-3xl overflow-hidden border-primary/30 shadow-[0_0_50px_rgba(112,12,255,0.15)] animate-in fade-in zoom-in-95 duration-700 relative">
        
        {/* Glow Effects */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 flex gap-1.5 p-5 z-10">
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-700 ease-out ${step >= i ? 'bg-primary shadow-[0_0_12px_rgba(109,40,217,0.8)]' : 'bg-white/5'}`} />
          ))}
        </div>

        {/* Carousel Steps */}
        <div className="p-8 pt-20 relative z-10">
          {/* STEP 1: Feature 1 */}
          {step === 1 && (
            <div className="space-y-8 text-center animate-in slide-in-from-right-12 duration-700 fade-in">
              <div className="w-full h-64 bg-gradient-to-br from-primary/20 via-purple-500/10 to-transparent rounded-3xl border border-primary/20 flex flex-col items-center justify-center relative mb-8 group overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors duration-500" />
                <BarChart3 className="w-20 h-20 text-primary mb-4 animate-bounce-slow" />
                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Dashboard Institutionnel</h3>
                <p className="text-sm text-white/70 relative z-10">Toutes vos métriques en temps réel.</p>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Maîtrisez vos statistiques</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Prenez des décisions basées sur la data. Visualisez votre Win Rate, Profit Factor et R-Multiple instantanément.
              </p>
              <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg rounded-full shadow-[0_0_20px_rgba(109,40,217,0.4)] hover:shadow-[0_0_30px_rgba(109,40,217,0.6)] transition-all" onClick={handleNext}>
                Suivant <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 2: Feature 2 */}
          {step === 2 && (
            <div className="space-y-8 text-center animate-in slide-in-from-right-12 duration-700 fade-in">
              <div className="w-full h-64 bg-gradient-to-br from-blue-500/20 via-cyan-500/10 to-transparent rounded-3xl border border-blue-500/20 flex flex-col items-center justify-center relative mb-8 group overflow-hidden">
                <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors duration-500" />
                <BookOpen className="w-20 h-20 text-blue-400 mb-4 animate-pulse" />
                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Journal Avancé</h3>
                <p className="text-sm text-white/70 relative z-10">Tracez chaque trade avec précision.</p>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Ne laissez rien au hasard</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Enregistrez vos entrées, sorties, émotions et erreurs. Attachez des captures d'écran pour revoir vos setups.
              </p>
              <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all bg-blue-600 hover:bg-blue-500" onClick={handleNext}>
                Suivant <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 3: Feature 3 */}
          {step === 3 && (
            <div className="space-y-8 text-center animate-in slide-in-from-right-12 duration-700 fade-in">
              <div className="w-full h-64 bg-gradient-to-br from-emerald-500/20 via-green-500/10 to-transparent rounded-3xl border border-emerald-500/20 flex flex-col items-center justify-center relative mb-8 group overflow-hidden">
                <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                <CalendarIcon className="w-20 h-20 text-emerald-400 mb-4 animate-bounce-slow" />
                <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Calendrier de Performance</h3>
                <p className="text-sm text-white/70 relative z-10">La régularité visuelle.</p>
              </div>
              <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Bâtissez votre constance</h2>
              <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Visualisez vos jours de gain et de perte. Le calendrier transforme la rigueur en un jeu vidéo où l'objectif est de rester vert.
              </p>
              <Button size="lg" className="w-full sm:w-auto px-12 h-14 text-lg rounded-full shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all bg-emerald-600 hover:bg-emerald-500" onClick={handleNext}>
                Configurer mon profil <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 4: Profile Setup */}
          {step === 4 && (
            <div className="space-y-8 animate-in slide-in-from-right-12 duration-700 fade-in text-left py-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Identité</h2>
                <p className="text-muted-foreground text-lg">Quel est votre nom d'opérateur ?</p>
              </div>
              <div className="space-y-3">
                <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Nom / Pseudo</Label>
                <Input 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  placeholder="Ex: Sacha, TraderX..." 
                  className="bg-white/5 border-white/10 h-14 text-xl rounded-xl focus:border-primary focus:bg-white/10 transition-all placeholder:text-white/20"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && fullName.trim() && handleNext()}
                />
              </div>
              <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.2)]" onClick={handleNext} disabled={!fullName.trim()}>
                Continuer <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 5: Setup Configuration */}
          {step === 5 && (
            <div className="space-y-8 animate-in slide-in-from-right-12 duration-700 fade-in text-left py-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Votre Stratégie</h2>
                <p className="text-muted-foreground text-lg">Définissez votre premier setup et ses règles de confirmation.</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Nom du Setup</Label>
                  <Input 
                    value={setupName} 
                    onChange={(e) => setSetupName(e.target.value)} 
                    placeholder="Ex: Breakout Asiatique, SMC..." 
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all placeholder:text-white/20"
                    autoFocus
                  />
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Règles / Checklist (Optionnel)</Label>
                  <div className="space-y-2 mb-2">
                    {setupRules.map((rule, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-lg">
                        <span className="text-sm text-primary-foreground font-medium">{rule}</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-400" onClick={() => handleRemoveRule(idx)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={newRule} 
                      onChange={(e) => setNewRule(e.target.value)} 
                      placeholder="Ex: Tendance H4 haussière" 
                      className="bg-white/5 border-white/10 h-11 rounded-lg focus:border-primary transition-all placeholder:text-white/20"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRule())}
                    />
                    <Button type="button" onClick={handleAddRule} disabled={!newRule.trim()} className="h-11 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.2)] mt-8" onClick={handleNext} disabled={!setupName.trim()}>
                Continuer <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 6: Session Configuration */}
          {step === 6 && (
            <div className="space-y-8 animate-in slide-in-from-right-12 duration-700 fade-in text-left py-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Horaires de Trading</h2>
                <p className="text-muted-foreground text-lg">Quand préférez-vous trader ?</p>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Nom de la Session</Label>
                  <Input 
                    value={sessionName} 
                    onChange={(e) => setSessionName(e.target.value)} 
                    placeholder="Ex: London Open, New York Morning..." 
                    className="bg-white/5 border-white/10 h-14 text-xl rounded-xl focus:border-primary transition-all placeholder:text-white/20"
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Heure de Début</Label>
                    <Input 
                      type="time"
                      value={startTime} 
                      onChange={(e) => setStartTime(e.target.value)} 
                      className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all text-white block w-full [color-scheme:dark]"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Heure de Fin</Label>
                    <Input 
                      type="time"
                      value={endTime} 
                      onChange={(e) => setEndTime(e.target.value)} 
                      className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all text-white block w-full [color-scheme:dark]"
                    />
                  </div>
                </div>
              </div>
              <Button size="lg" className="w-full h-14 text-lg rounded-xl shadow-[0_0_20px_rgba(109,40,217,0.2)]" onClick={handleNext} disabled={!sessionName.trim()}>
                Continuer <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          )}

          {/* STEP 7: Account Setup & Finish */}
          {step === 7 && (
            <div className="space-y-8 animate-in slide-in-from-right-12 duration-700 fade-in text-left py-4">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">Premier Capital</h2>
                <p className="text-muted-foreground text-lg">Ajoutez un compte pour commencer (Optionnel).</p>
              </div>
              <div className="space-y-5">
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Prop Firm / Courtier</Label>
                  <Input 
                    value={providerName} 
                    onChange={(e) => setProviderName(e.target.value)} 
                    placeholder="Ex: FTMO, Topstep..." 
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all placeholder:text-white/20"
                    autoFocus
                  />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm uppercase tracking-wider text-muted-foreground font-semibold">Taille du Compte ($)</Label>
                  <Input 
                    type="number"
                    value={accountSize} 
                    onChange={(e) => setAccountSize(e.target.value)} 
                    placeholder="Ex: 50000" 
                    className="bg-white/5 border-white/10 h-12 rounded-xl focus:border-primary transition-all placeholder:text-white/20"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <Button size="lg" variant="ghost" className="flex-1 h-14 text-lg rounded-xl hover:bg-white/5" onClick={handleFinish} disabled={loading}>
                  Passer
                </Button>
                <Button size="lg" className="flex-1 h-14 text-lg font-bold rounded-xl shadow-[0_0_30px_rgba(109,40,217,0.4)]" onClick={handleFinish} disabled={loading}>
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
