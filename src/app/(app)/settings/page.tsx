import { getSessions } from '@/lib/actions/sessions';
import { SettingsClient } from '@/components/settings/settings-client';

export default async function SettingsPage() {
  const sessionsResult = await getSessions();
  const sessions = sessionsResult.ok && sessionsResult.data ? sessionsResult.data : [];

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
      <SettingsClient initialSessions={sessions} />
    </div>
  );
}
