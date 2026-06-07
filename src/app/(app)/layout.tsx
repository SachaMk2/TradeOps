import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AppSidebar } from '@/components/layout/app-sidebar';
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
    <div className="flex min-h-screen">
      <AppSidebar userName={fullName} />
      {needsOnboarding && <OnboardingFlow />}
      <main className="flex-1 ml-56 transition-all duration-300">
        <div className="p-6 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
