'use client';

import { useState } from 'react';
import { PaywallModal } from './paywall-modal';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/browser';

export function PaywallFlow() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubscribe() {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Erreur lors de la création de la session Stripe.");
      }
    } catch (error) {
      toast.error("Impossible de contacter le serveur de paiement.");
    } finally {
      setIsLoading(false);
    }
  }
  async function handleSimulate() {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.from('profiles').update({ is_premium: true }).eq('id', user.id);
        if (error) throw error;
        toast.success("Paiement simulé avec succès !");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (error) {
      toast.error("Erreur lors de la simulation du paiement.");
      setIsLoading(false);
    }
  }

  return <PaywallModal onSubscribe={handleSubscribe} onSimulate={handleSimulate} isLoading={isLoading} />;
}
