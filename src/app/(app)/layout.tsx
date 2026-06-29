import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppMobileNav } from '@/components/layout/app-mobile-nav';
import { isDevBypass } from '@/lib/mock/bypass';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';

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

  return (
    <div className="flex min-h-screen relative">
      <AppSidebar userName={fullName} />
      <AppMobileNav />
      {needsOnboarding && <OnboardingFlow />}
      <main className="flex-1 ml-0 md:ml-56 transition-[margin] duration-300 flex flex-col items-center pb-24 md:pb-0 max-w-[100vw] overflow-x-hidden">
        <div className="p-4 md:p-10 w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
}
