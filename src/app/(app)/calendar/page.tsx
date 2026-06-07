import { getTrades } from '@/lib/actions/trades';
import { CalendarClient } from '@/components/calendar/calendar-client';

export default async function CalendarPage() {
  const tradesResult = await getTrades();
  const trades = tradesResult.ok && tradesResult.data ? tradesResult.data : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-primary drop-shadow-sm">
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Daily performance overview — RR, win rate, and trade count
        </p>
      </div>
      <CalendarClient trades={trades} />
    </div>
  );
}
