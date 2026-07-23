import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppMobileNav } from '@/components/layout/app-mobile-nav';
import { isDevBypass } from '@/lib/mock/bypass';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { PaywallFlow } from '@/components/paywall/paywall-flow';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && !isDevBypass()) {
    redirect('/login');
  }

  const userMeta = user?.user_metadata || {};
  const needsOnboarding = !userMeta.onboarding_completed;
  const fullName = userMeta.full_name || 'Opérateur';
  const isAdmin = user?.email?.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();

  // Check premium status
  let isPremium = true;
  if (!isDevBypass() && user) {
    if (isAdmin) {
      isPremium = true;
    } else {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_premium')
        .eq('id', user.id)
        .single();
      
      isPremium = profile?.is_premium ?? false;
    }
  }

  return (
    <div className="flex min-h-screen relative">
      <AppSidebar userName={fullName} isAdmin={isAdmin} />
      <AppMobileNav isAdmin={isAdmin} />
      
      {/* Modals with z-index ordering: Onboarding on top of Paywall */}
      <div className="relative z-[60]">
        {needsOnboarding && <OnboardingFlow />}
      </div>
      <div className="relative z-[50]">
        {!needsOnboarding && !isPremium && <PaywallFlow />}
      </div>

      <main className="flex-1 ml-0 md:ml-[var(--sidebar-width,14rem)] transition-[margin] duration-300 flex flex-col items-center pb-24 md:pb-0 max-w-[100vw] overflow-x-hidden">
        <div className="p-4 md:p-10 w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
