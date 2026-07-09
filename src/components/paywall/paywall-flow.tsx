'use client';

import { useState } from 'react';
import { PaywallModal } from './paywall-modal';
import { toast } from 'sonner';

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

  return <PaywallModal onSubscribe={handleSubscribe} isLoading={isLoading} />;
}
