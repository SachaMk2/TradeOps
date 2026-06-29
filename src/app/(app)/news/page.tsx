import { getEconomicNews } from '@/lib/actions/news';
import { NewsClient } from '@/components/news/news-client';

export const metadata = {
  title: 'Economic Calendar | SACH MK2',
  description: 'Track high-impact economic news',
};

export default async function NewsPage() {
  const result = await getEconomicNews();
  const newsEvents = result.ok && result.data ? result.data : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-glow-primary">Economic Calendar</h1>
          <p className="text-muted-foreground mt-1">Track high-impact news for the current week to avoid surprises.</p>
        </div>
      </div>

      {result.ok ? (
        <NewsClient initialData={newsEvents} />
      ) : (
        <div className="glass p-8 text-center text-loss border-loss/20 rounded-xl">
          <p>Failed to load economic news: {result.error}</p>
        </div>
      )}
    </div>
  );
}
