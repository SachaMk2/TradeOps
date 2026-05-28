import { getTrades } from '@/lib/actions/trades';
import { getSetups } from '@/lib/actions/setups';
import { getAccounts } from '@/lib/actions/accounts';
import { JournalClient } from '@/components/journal/journal-client';

export default async function JournalPage() {
  const [tradesResult, setupsResult, accountsResult] = await Promise.all([
    getTrades(),
    getSetups(),
    getAccounts(),
  ]);

  const trades = tradesResult.ok ? tradesResult.data : [];
  const setups = setupsResult.ok ? setupsResult.data : [];
  const accounts = accountsResult.ok ? accountsResult.data : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary drop-shadow-sm">Journal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {trades.length} trade{trades.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
      </div>
      <JournalClient
        initialTrades={trades}
        setups={setups}
        accounts={accounts}
      />
    </div>
  );
}
