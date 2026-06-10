import { getMindDumps } from '@/lib/actions/mind-dumps';
import { MindDumpClient } from '@/components/mind-dump/mind-dump-client';

export const metadata = {
  title: 'Mind Dump | SACH MK2',
  description: 'Log your trading thoughts and ideas',
};

export default async function MindDumpPage() {
  const result = await getMindDumps();
  const mindDumps = result.ok && result.data ? result.data : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow-primary">Mind Dump</h1>
          <p className="text-muted-foreground mt-1">Empty your head, log your daily insights, and clear your mind before the next session.</p>
        </div>
      </div>

      <MindDumpClient initialDumps={mindDumps} />
    </div>
  );
}
