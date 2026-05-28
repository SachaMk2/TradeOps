import { getTrades } from '@/lib/actions/trades';
import { getAccounts, getPayouts } from '@/lib/actions/accounts';
import { getSetups } from '@/lib/actions/setups';
import { getSessions } from '@/lib/actions/sessions';
import { DashboardClient } from '@/components/dashboard/dashboard-client';

export default async function DashboardPage() {
  const [tradesResult, accountsResult, payoutsResult, setupsResult, sessionsResult] = await Promise.all([
    getTrades(),
    getAccounts(),
    getPayouts(),
    getSetups(),
    getSessions(),
  ]);

  const trades = tradesResult.ok && tradesResult.data ? tradesResult.data : [];
  const accounts = accountsResult.ok && accountsResult.data ? accountsResult.data : [];
  const payouts = payoutsResult.ok && payoutsResult.data ? payoutsResult.data : [];
  const setups = setupsResult.ok && setupsResult.data ? setupsResult.data : [];
  const sessions = sessionsResult.ok && sessionsResult.data ? sessionsResult.data : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary drop-shadow-sm">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your trading performance at a glance
          </p>
        </div>
      </div>
      <DashboardClient
        trades={trades}
        accounts={accounts}
        payouts={payouts}
        setups={setups}
        sessions={sessions}
      />
    </div>
  );
}
