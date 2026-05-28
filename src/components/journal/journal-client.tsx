'use client';

import { useState, useMemo } from 'react';
import { type TradeWithRelations, type SetupWithChecklist, type Account } from '@/lib/supabase/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TradeDetailSheet } from './trade-detail-sheet';
import {
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  ArrowUpDown,
  X,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

interface JournalClientProps {
  initialTrades: TradeWithRelations[];
  setups: SetupWithChecklist[];
  accounts: Account[];
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

type SortKey = 'created_at' | 'pnl_currency' | 'adherence_pct' | 'pnl_r';

export function JournalClient({ initialTrades, setups, accounts }: JournalClientProps) {
  const [selectedTrade, setSelectedTrade] = useState<TradeWithRelations | null>(null);

  // Filters
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [filterSetup, setFilterSetup] = useState<string>('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredTrades = useMemo(() => {
    let filtered = [...initialTrades];

    if (filterAccount !== 'all') {
      filtered = filtered.filter((t) => t.trade_executions && t.trade_executions.some(e => e.account_id === filterAccount));
    }
    if (filterSetup !== 'all') {
      filtered = filtered.filter((t) => t.setup_id === filterSetup);
    }
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.instrument.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q)
      );
    }

    filtered = filtered.map(t => {
      let pnl = 0;
      if (t.trade_executions) {
        if (filterAccount !== 'all') {
          pnl = Number(t.trade_executions.find(e => e.account_id === filterAccount)?.pnl_currency || 0);
        } else {
          pnl = t.trade_executions.reduce((sum, e) => sum + Number(e.pnl_currency), 0);
        }
      }
      return { ...t, pnl_currency: pnl };
    });

    filtered.sort((a, b) => {
      const aVal = (a as any)[sortKey] ?? 0;
      const bVal = (b as any)[sortKey] ?? 0;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return filtered;
  }, [initialTrades, filterAccount, filterSetup, filterSearch, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  const hasFilters = filterAccount !== 'all' || filterSetup !== 'all' || filterSearch !== '';

  return (
    <>
      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Input
          value={filterSearch}
          onChange={(e) => setFilterSearch(e.target.value)}
          placeholder="Search instrument or notes..."
          className="bg-background/50 w-64"
        />

        <Select value={filterAccount} onValueChange={(v) => v && setFilterAccount(v)}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="All Accounts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Accounts</SelectItem>
            {accounts.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.nickname || a.provider_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterSetup} onValueChange={(v) => v && setFilterSetup(v)}>
          <SelectTrigger className="w-48 bg-background/50">
            <SelectValue placeholder="All Setups" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Setups</SelectItem>
            {setups.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setFilterAccount('all');
              setFilterSetup('all');
              setFilterSearch('');
            }}
            className="text-xs gap-1"
          >
            <X className="w-3 h-3" />
            Clear
          </Button>
        )}

        <div className="ml-auto">
          <Link href="/trades/new">
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Trade
            </Button>
          </Link>
        </div>
      </div>

      {/* Table */}
      {filteredTrades.length === 0 ? (
        <div className="glass rounded-xl p-12 text-center">
          <p className="text-muted-foreground">No trades found</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort('created_at')} className="flex items-center gap-1 hover:text-foreground transition-colors">
                      Date <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Instrument</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Dir</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Account</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Setup</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Session</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort('pnl_currency')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      P&L <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort('pnl_r')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      R <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    <button onClick={() => toggleSort('adherence_pct')} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">
                      Adh% <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Mistakes</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.map((trade) => {
                  const pnl = Number((trade as any).pnl_currency);
                  const pnlR = trade.pnl_r ? Number(trade.pnl_r) : null;
                  const setup = trade.setup as (typeof setups)[number] | null;
                  const execs = trade.trade_executions ?? [];
                  const accountNames = execs.map(e => (e as any).account?.nickname || (e as any).account?.provider_name || 'Unknown');
                  const accountText = accountNames.length > 1 ? `${accountNames.length} Accounts` : (accountNames[0] || '—');

                  return (
                    <tr
                      key={trade.id}
                      onClick={() => setSelectedTrade(trade)}
                      className="border-b border-border/30 hover:bg-accent/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {format(new Date(trade.entry_time || trade.created_at), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {trade.instrument}
                      </td>
                      <td className="px-4 py-3">
                        {trade.direction === 'long' ? (
                          <TrendingUp className="w-4 h-4 text-profit" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-loss" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground truncate max-w-[120px]" title={accountNames.join(', ')}>
                        {accountText}
                      </td>
                      <td className="px-4 py-3">
                        {setup ? (
                          <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: setup.color_code }} />
                            <span className="text-xs truncate max-w-[100px]">{setup.name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground capitalize">
                        {trade.session?.name ?? '—'}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm font-medium ${pnl >= 0 ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss'}`}>
                        {formatCurrency(pnl)}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono text-sm ${pnlR !== null ? (pnlR >= 0 ? 'text-profit text-glow-profit' : 'text-loss text-glow-loss') : 'text-muted-foreground'}`}>
                        {pnlR !== null ? `${pnlR.toFixed(2)}R` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right text-xs">
                        <span className={Number(trade.adherence_pct) >= 80 ? 'text-profit' : Number(trade.adherence_pct) >= 50 ? 'text-warning' : 'text-loss'}>
                          {trade.adherence_pct}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {(trade.mistake_tags ?? []).slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px] py-0 px-1.5 border-loss/30 text-loss/80">
                              {tag.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {(trade.mistake_tags ?? []).length > 2 && (
                            <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                              +{trade.mistake_tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {trade.screenshot_urls && trade.screenshot_urls.length > 0 && (
                          <div className="flex items-center gap-1">
                            <ImageIcon className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{trade.screenshot_urls.length}</span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TradeDetailSheet
        trade={selectedTrade}
        onClose={() => setSelectedTrade(null)}
      />
    </>
  );
}
