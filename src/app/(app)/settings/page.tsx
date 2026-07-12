import { getSessions } from '@/lib/actions/sessions';
import { SettingsClient } from '@/components/settings/settings-client';
import { createClient } from '@/lib/supabase/server';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const fullName = user?.user_metadata?.full_name || '';

  const sessionsResult = await getSessions();
  const sessions = sessionsResult.ok && sessionsResult.data ? sessionsResult.data : [];

  let isPremium = false;
  let stripeCustomerId = null;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_premium, stripe_customer_id')
      .eq('id', user.id)
      .single();
    
    isPremium = profile?.is_premium ?? false;
    stripeCustomerId = profile?.stripe_customer_id ?? null;
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary drop-shadow-sm">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Customize your TradeOps workspace.
        </p>
      </div>
      <SettingsClient 
        initialSessions={sessions} 
        initialFullName={fullName} 
        isPremium={isPremium}
        stripeCustomerId={stripeCustomerId}
      />
    </div>
  );
}
