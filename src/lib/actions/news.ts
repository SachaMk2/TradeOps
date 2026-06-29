'use server';

export interface EconomicNews {
  title: string;
  country: string;
  date: string;
  impact: 'High' | 'Medium' | 'Low' | 'Non-Economic';
  forecast: string;
  previous: string;
}

export async function getEconomicNews(): Promise<{ ok: boolean; data?: EconomicNews[]; error?: string }> {
  try {
    // ForexFactory unofficial JSON feed. Next.js fetches and caches it for 1 hour.
    const res = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      return { ok: false, error: 'Failed to fetch economic news' };
    }

    const data: EconomicNews[] = await res.json();
    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: error.message || 'An error occurred' };
  }
}
