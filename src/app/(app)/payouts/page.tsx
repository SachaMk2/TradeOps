import { getAccounts, getPayouts } from '@/lib/actions/accounts';
import { PayoutsClient } from '@/components/payouts/payouts-client';

export default async function PayoutsPage() {
  const [accountsRes, payoutsRes] = await Promise.all([
    getAccounts(),
    getPayouts(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Payouts</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Track your withdrawals and profit splits.
          </p>
        </div>
      </div>

      <PayoutsClient
        accounts={accountsRes.ok ? accountsRes.data : []}
        payouts={payoutsRes.ok ? payoutsRes.data : []}
      />
    </div>
  );
}
