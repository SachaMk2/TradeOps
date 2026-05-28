import { getSessions } from '@/lib/actions/sessions';
import { getSetups } from '@/lib/actions/setups';
import { getAccounts } from '@/lib/actions/accounts';
import { getTrade } from '@/lib/actions/trades';
import { TradeForm } from '@/components/trades/trade-form';
import { notFound } from 'next/navigation';

interface EditTradePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTradePage({ params }: EditTradePageProps) {
  const { id } = await params;

  const [setupsResult, accountsResult, sessionsResult, tradeResult] = await Promise.all([
    getSetups(),
    getAccounts(),
    getSessions(),
    getTrade(id),
  ]);

  if (!tradeResult.ok || !tradeResult.data) {
    notFound();
  }

  const setups = setupsResult.ok && setupsResult.data ? setupsResult.data.filter((s) => !s.is_archived) : [];
  const accounts = accountsResult.ok && accountsResult.data ? accountsResult.data.filter((a) => a.phase !== 'failed') : [];
  const sessions = sessionsResult.ok && sessionsResult.data ? sessionsResult.data : [];
  const trade = tradeResult.data;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Trade</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update the trade context, checklist adherence, reflection, or executions.
        </p>
      </div>
      <TradeForm
        setups={setups}
        accounts={accounts}
        sessions={sessions}
        trade={trade}
      />
    </div>
  );
}
