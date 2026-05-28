import { getSetups } from '@/lib/actions/setups';
import { SetupsPageClient } from '@/components/setups/setups-page-client';

export default async function SetupsPage() {
  const result = await getSetups();
  const setups = result.ok ? result.data : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Setups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your trading playbooks and checklists
          </p>
        </div>
      </div>
      <SetupsPageClient initialSetups={setups} />
    </div>
  );
}
