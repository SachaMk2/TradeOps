'use client';

import { useState, useMemo } from 'react';
import { type EconomicNews } from '@/lib/actions/news';
import { format, isSameDay } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock, Globe, AlertTriangle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface NewsClientProps {
  initialData: EconomicNews[];
}

function getImpactColor(impact: string) {
  switch (impact) {
    case 'High': return 'bg-loss/20 text-loss border-loss/30';
    case 'Medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'Low': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    default: return 'bg-muted/30 text-muted-foreground border-border/50';
  }
}

export function NewsClient({ initialData }: NewsClientProps) {
  const [onlyHighImpact, setOnlyHighImpact] = useState(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>(['USD', 'EUR', 'GBP']);

  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'NZD', 'CHF'];

  function toggleCurrency(curr: string) {
    setSelectedCurrencies(prev => 
      prev.includes(curr) ? prev.filter(c => c !== curr) : [...prev, curr]
    );
  }

  // Filter and group by day
  const groupedNews = useMemo(() => {
    let filtered = initialData.filter(item => {
      if (item.impact === 'Non-Economic') return false;
      if (onlyHighImpact && item.impact !== 'High') return false;
      if (selectedCurrencies.length > 0 && !selectedCurrencies.includes(item.country)) return false;
      return true;
    });

    const groups = new Map<string, EconomicNews[]>();
    
    for (const item of filtered) {
      const dateObj = new Date(item.date);
      // Format as YYYY-MM-DD for grouping
      const dateKey = format(dateObj, 'yyyy-MM-dd');
      
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(item);
    }

    // Convert to array and sort by date ascending
    const sortedGroups = Array.from(groups.entries()).map(([dateStr, items]) => ({
      date: new Date(dateStr),
      items: items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    })).sort((a, b) => a.date.getTime() - b.date.getTime());

    return sortedGroups;
  }, [initialData, onlyHighImpact, selectedCurrencies]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass p-4 rounded-xl border-border/50 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between sticky top-4 z-10">
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs uppercase tracking-wider text-muted-foreground mr-2 font-semibold">Currencies</span>
          {currencies.map(c => (
            <button
              key={c}
              onClick={() => toggleCurrency(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors duration-200 border ${
                selectedCurrencies.includes(c) 
                  ? 'bg-primary/20 text-primary border-primary/40' 
                  : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Switch 
            id="high-impact" 
            checked={onlyHighImpact} 
            onCheckedChange={setOnlyHighImpact} 
          />
          <Label htmlFor="high-impact" className="text-sm cursor-pointer flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-loss" />
            High Impact Only
          </Label>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-8">
        {groupedNews.length === 0 ? (
          <div className="text-center py-12 glass rounded-2xl border-dashed border-border/50 text-muted-foreground">
            No news found matching your filters.
          </div>
        ) : (
          groupedNews.map((group) => (
            <div key={group.date.toISOString()} className="space-y-4">
              <h3 className="font-bold text-lg text-foreground/90 flex items-center gap-2 sticky top-24 bg-background/80 backdrop-blur-md py-2 z-10">
                <Clock className="w-5 h-5 text-primary" />
                {format(group.date, 'EEEE, MMMM do')}
                {isSameDay(group.date, new Date()) && (
                  <Badge className="ml-2 bg-primary/20 text-primary hover:bg-primary/30 border-none">Today</Badge>
                )}
              </h3>

              <div className="grid gap-3">
                {group.items.map((item, i) => (
                  <div key={i} className="glass interactive-card rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center border-border/50">
                    {/* Time & Currency */}
                    <div className="flex items-center gap-4 sm:w-48 shrink-0">
                      <div className="font-mono font-medium">
                        {format(new Date(item.date), 'HH:mm')}
                      </div>
                      <Badge variant="outline" className="font-bold">
                        <Globe className="w-3 h-3 mr-1.5 opacity-50" />
                        {item.country}
                      </Badge>
                    </div>

                    {/* Impact & Title */}
                    <div className="flex-1 flex items-center gap-3">
                      <Badge className={getImpactColor(item.impact)}>
                        {item.impact}
                      </Badge>
                      <span className="font-semibold">{item.title}</span>
                    </div>

                    {/* Forecast / Previous */}
                    <div className="flex items-center gap-6 sm:w-48 shrink-0 text-xs sm:text-sm">
                      <div className="flex flex-col">
                        <span className="text-muted-foreground/60 text-[10px] uppercase">Forecast</span>
                        <span className="font-mono">{item.forecast || '-'}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-muted-foreground/60 text-[10px] uppercase">Previous</span>
                        <span className="font-mono text-muted-foreground">{item.previous || '-'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
