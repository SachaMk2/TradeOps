import { getAccounts, getLifetimePropROI } from '@/lib/actions/accounts';
import { KanbanBoard } from '@/components/accounts/kanban-board';

export default async function AccountsPage() {
  const [accountsResult, roiResult] = await Promise.all([
    getAccounts(),
    getLifetimePropROI(),
  ]);

  const accounts = accountsResult.ok ? accountsResult.data : [];
  const roi = roiResult.ok ? roiResult.data : { totalFees: 0, totalPayouts: 0, roi: 0 };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary drop-shadow-sm">Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Drag accounts across phases to track your pipeline
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Lifetime Prop ROI</p>
          <p className={`text-2xl font-bold ${roi.roi >= 0 ? 'text-profit' : 'text-loss'}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(roi.roi)}
          </p>
        </div>
      </div>
      <KanbanBoard initialAccounts={accounts} />
    </div>
  );
}
