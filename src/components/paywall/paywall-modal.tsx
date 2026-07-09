'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Clock, Sparkles } from 'lucide-react';

interface PaywallModalProps {
  onSubscribe: () => void;
  isLoading: boolean;
}

export function PaywallModal({ onSubscribe, isLoading }: PaywallModalProps) {
  const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds

  useEffect(() => {
    // Fake 24h countdown logic based on localStorage
    const storedEndTime = localStorage.getItem('sachmk2_paywall_end');
    let endTime = storedEndTime ? parseInt(storedEndTime, 10) : null;

    if (!endTime || endTime < Date.now()) {
      endTime = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('sachmk2_paywall_end', endTime.toString());
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-background/80">
      <div className="w-full max-w-lg glass interactive-card rounded-3xl p-8 text-center border-primary/30 relative overflow-hidden shadow-[0_0_50px_rgba(112,12,255,0.15)]">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
        
        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30 relative z-10">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">
          Débloquez Rise Dash
        </h2>
        <p className="text-muted-foreground mb-8 relative z-10 text-sm">
          Pour accéder à votre dashboard, à votre journal et à vos statistiques institutionnelles, vous devez souscrire à notre abonnement premium.
        </p>

        {/* Pricing Box */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 relative z-10">
          <div className="flex items-center justify-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Offre de lancement</span>
          </div>
          
          <div className="flex items-baseline justify-center gap-3 mb-4">
            <span className="text-2xl text-white/40 line-through decoration-red-500/50">29.99€</span>
            <span className="text-5xl font-extrabold text-white">9.99€<span className="text-xl text-white/60 font-medium">/mois</span></span>
          </div>

          {/* Countdown */}
          <div className="flex items-center justify-center gap-2 text-red-400 bg-red-500/10 py-2 px-4 rounded-full border border-red-500/20 w-fit mx-auto">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold tracking-tight">L'offre expire dans {formatTime(timeLeft)}</span>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full h-14 text-lg font-semibold rounded-xl bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all relative z-10"
          onClick={onSubscribe}
          disabled={isLoading}
        >
          {isLoading ? 'Redirection...' : 'Profiter de la réduction'}
        </Button>
        <p className="text-xs text-muted-foreground mt-4 relative z-10">
          Paiement sécurisé via Stripe. Annulable à tout moment.
        </p>
      </div>
    </div>
  );
}
