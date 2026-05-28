import { getSessions } from '@/lib/actions/sessions';
import { getSetups } from '@/lib/actions/setups';
import { getAccounts } from '@/lib/actions/accounts';
import { TradeForm } from '@/components/trades/trade-form';

export default async function NewTradePage() {
  const [setupsResult, accountsResult, sessionsResult] = await Promise.all([
    getSetups(),
    getAccounts(),
    getSessions(),
  ]);

  const setups = setupsResult.ok && setupsResult.data ? setupsResult.data.filter((s) => !s.is_archived) : [];
  const accounts = accountsResult.ok && accountsResult.data ? accountsResult.data.filter((a) => a.phase !== 'failed') : [];
  const sessions = sessionsResult.ok && sessionsResult.data ? sessionsResult.data : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Log Trade</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record a new trade with full context, pricing, and reflection
        </p>
      </div>
      <TradeForm setups={setups} accounts={accounts} sessions={sessions} />
    </div>
  );
}
