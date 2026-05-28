import { getGoals } from '@/lib/actions/goals';
import { GoalsClient } from '@/components/goals/goals-client';

export default async function GoalsPage() {
  const goalsRes = await getGoals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary drop-shadow-sm">Goals Hub</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Set targets, build habits, and track your progress.
          </p>
        </div>
      </div>

      <GoalsClient goals={goalsRes.ok ? goalsRes.data : []} />
    </div>
  );
}
