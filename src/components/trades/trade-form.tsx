'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { type SetupWithChecklist, type Account, type ChecklistItem, type TradingSession, type TradeWithRelations } from '@/lib/supabase/types';
import { logTrade, updateTradeFull } from '@/lib/actions/trades';
import { uploadScreenshots } from '@/lib/actions/screenshots';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Loader2, TrendingUp, TrendingDown, CheckCircle2, ImagePlus, X } from 'lucide-react';
import { toast } from 'sonner';

const EMOTIONS = [
  { value: 'calm', label: 'Calm', emoji: '😌' },
  { value: 'confident', label: 'Confident', emoji: '💪' },
  { value: 'anxious', label: 'Anxious', emoji: '😰' },
  { value: 'fomo', label: 'FOMO', emoji: '😤' },
  { value: 'revenge', label: 'Revenge', emoji: '😡' },
  { value: 'tired', label: 'Tired', emoji: '😴' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
] as const;

const MISTAKE_TAGS = [
  'moved_sl', 'no_confirmation', 'oversize', 'fomo', 'revenge',
  'cut_winner_early', 'held_loser_too_long', 'traded_news',
  'broke_setup_rules', 'chasing',
];

interface TradeFormProps {
  setups: SetupWithChecklist[];
  accounts: Account[];
  sessions: TradingSession[];
  trade?: TradeWithRelations;
}

export function TradeForm({ setups, accounts, sessions, trade }: TradeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Context
  const [setupId, setSetupId] = useState<string>(trade?.setup_id || '');
  const [instrument, setInstrument] = useState(trade?.instrument || '');
  const [direction, setDirection] = useState<'long' | 'short'>(trade?.direction || 'long');
  const [sessionId, setSessionId] = useState<string>(trade?.session_id || '');
  const [status, setStatus] = useState<'open' | 'closed' | 'cancelled'>(trade?.status || 'closed');
  const [entryTime, setEntryTime] = useState(
    trade?.entry_time
      ? (() => {
          const d = new Date(trade.entry_time);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          const hours = String(d.getHours()).padStart(2, '0');
          const minutes = String(d.getMinutes()).padStart(2, '0');
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        })()
      : ''
  );

  // Accounts & P&L
  const [selectedAccounts, setSelectedAccounts] = useState<{ accountId: string; pnlCurrency: string }[]>(
    trade?.trade_executions && trade.trade_executions.length > 0
      ? trade.trade_executions.map((e) => ({
          accountId: e.account_id,
          pnlCurrency: e.pnl_currency.toString(),
        }))
      : [{ accountId: accounts[0]?.id || '', pnlCurrency: '' }]
  );
  const [pnlR, setPnlR] = useState(trade?.pnl_r ? trade.pnl_r.toString() : '');

  // Checklist snapshot
  const [checklistItems, setChecklistItems] = useState<(ChecklistItem & { is_respected: boolean })[]>(
    trade?.trade_checklist_items && trade.trade_checklist_items.length > 0
      ? trade.trade_checklist_items.map((item) => ({
          id: item.id,
          setup_id: trade.setup_id || '',
          content: item.content,
          position: item.position,
          created_at: new Date().toISOString(),
          is_respected: item.is_respected,
        }))
      : []
  );

  // Reflection
  const [emotionalState, setEmotionalState] = useState(trade?.emotional_state || 'neutral');
  const [notes, setNotes] = useState(trade?.notes || '');
  const [selectedMistakes, setSelectedMistakes] = useState<string[]>(trade?.mistake_tags || []);
  
  // Screenshots separated
  const [existingScreenshots, setExistingScreenshots] = useState<string[]>(trade?.screenshot_urls || []);
  const [newScreenshots, setNewScreenshots] = useState<string[]>([]);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  // Keep track of first render to prevent clobbering checklist snapshot when setupId is loaded from existing trade
  const [isFirstRender, setIsFirstRender] = useState(true);

  // When setup changes, load its checklist (all pre-ticked)
  useEffect(() => {
    if (isFirstRender && trade) {
      setIsFirstRender(false);
      return;
    }

    if (setupId) {
      const setup = setups.find((s) => s.id === setupId);
      if (setup) {
        setChecklistItems(
          setup.checklist_items.map((item) => ({
            ...item,
            is_respected: true,
          }))
        );
      }
    } else {
      setChecklistItems([]);
    }
  }, [setupId, setups]);



  function toggleMistake(tag: string) {
    setSelectedMistakes((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    const fileArray = Array.from(files);
    const urls = fileArray.map((f) => URL.createObjectURL(f));
    setNewScreenshots((prev) => [...prev, ...urls]);
    setScreenshotFiles((prev) => [...prev, ...fileArray]);
  }

  function removeScreenshot(index: number) {
    if (index < existingScreenshots.length) {
      setExistingScreenshots((prev) => prev.filter((_, i) => i !== index));
    } else {
      const fileIndex = index - existingScreenshots.length;
      setNewScreenshots((prev) => prev.filter((_, i) => i !== fileIndex));
      setScreenshotFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!instrument.trim()) {
      toast.error('Instrument is required');
      return;
    }

    setLoading(true);

    const snapshot = checklistItems.map((item, idx) => ({
      content: item.content,
      is_respected: item.is_respected,
      position: idx,
    }));

    // Upload screenshots to Supabase Storage
    let uploadedUrls: string[] = [];
    if (screenshotFiles.length > 0) {
      const formData = new FormData();
      screenshotFiles.forEach((file) => formData.append('files', file));
      const uploadResult = await uploadScreenshots(formData);
      if (!uploadResult.ok) {
        toast.error('Failed to upload screenshots: ' + uploadResult.error);
        setLoading(false);
        return;
      }
      uploadedUrls = uploadResult.data ?? [];
    }

    const finalScreenshotUrls = [...existingScreenshots, ...uploadedUrls];

    const payload = {
      accounts: selectedAccounts
        .filter((a) => a.accountId)
        .map((a) => ({
          account_id: a.accountId,
          pnl_currency: parseFloat(a.pnlCurrency) || 0,
        })),
      setup_id: setupId || null,
      instrument: instrument.trim().toUpperCase(),
      direction,
      session_id: sessionId || null,
      pnl_r: pnlR ? parseFloat(pnlR) : null,
      status,
      entry_time: entryTime ? new Date(entryTime).toISOString() : null,
      emotional_state: emotionalState,
      notes,
      screenshot_urls: finalScreenshotUrls,
      mistake_tags: selectedMistakes,
      checklist_snapshot: snapshot,
    };

    let result;
    if (trade) {
      result = await updateTradeFull(trade.id, payload);
    } else {
      result = await logTrade(payload);
    }

    if (result.ok) {
      toast.success(trade ? 'Trade updated' : 'Trade logged');
      router.push('/journal');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* SECTION 1: Context */}
      <section className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">1</span>
          Context
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Instrument</Label>
            <Input
              value={instrument}
              onChange={(e) => setInstrument(e.target.value)}
              placeholder="EURUSD, NAS100, XAUUSD"
              required
              className="bg-background/50 uppercase"
            />
          </div>

          <div className="space-y-2">
            <Label>Direction</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={direction === 'long' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDirection('long')}
                className={`flex-1 gap-1.5 ${direction === 'long' ? 'bg-profit text-white hover:bg-profit/90' : ''}`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                Long
              </Button>
              <Button
                type="button"
                variant={direction === 'short' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setDirection('short')}
                className={`flex-1 gap-1.5 ${direction === 'short' ? 'bg-loss text-white hover:bg-loss/90' : ''}`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Short
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Session</Label>
            <Select
              value={sessionId}
              onValueChange={(v) => v && setSessionId(v)}
            >
              <SelectTrigger className="bg-background/50">
                {sessionId ? sessions.find(s => s.id === sessionId)?.name : <span className="text-muted-foreground">Select session...</span>}
              </SelectTrigger>
              <SelectContent>
                {sessions.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>


          <div className="space-y-2">
            <Label>Setup</Label>
            <Select value={setupId} onValueChange={(v) => v && setSetupId(v)}>
              <SelectTrigger className="bg-background/50">
                {setupId ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: setups.find(s => s.id === setupId)?.color_code }} />
                    {setups.find(s => s.id === setupId)?.name}
                  </div>
                ) : (
                  <span className="text-muted-foreground">Select setup...</span>
                )}
              </SelectTrigger>
              <SelectContent>
                {setups.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color_code }} />
                      {s.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v as 'open' | 'closed' | 'cancelled')}>
              <SelectTrigger className="bg-background/50 capitalize">
                {status || <span className="text-muted-foreground">Select status...</span>}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Entry Time</Label>
            <Input
              type="datetime-local"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="bg-background/50"
            />
          </div>

        </div>
      </section>

      {/* SECTION 2: Accounts & Results */}
      <section className="glass rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">2</span>
            Executions
          </h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setSelectedAccounts([...selectedAccounts, { accountId: '', pnlCurrency: '' }])}
          >
            + Add Account
          </Button>
        </div>

        <div className="space-y-4">
          {selectedAccounts.map((acc, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="space-y-2 flex-1">
                <Label>Account</Label>
                <Select
                  value={acc.accountId}
                  onValueChange={(v) => {
                    if (!v) return;
                    const newAccs = [...selectedAccounts];
                    newAccs[index].accountId = v;
                    setSelectedAccounts(newAccs);
                  }}
                >
                  <SelectTrigger className="bg-background/50">
                    {acc.accountId ? accounts.find(a => a.id === acc.accountId)?.nickname || accounts.find(a => a.id === acc.accountId)?.provider_name : <span className="text-muted-foreground">Select account...</span>}
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.nickname || a.provider_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 w-48">
                <Label>P&L ($)</Label>
                <Input
                  type="number"
                  step="any"
                  value={acc.pnlCurrency}
                  onChange={(e) => {
                    const newAccs = [...selectedAccounts];
                    newAccs[index].pnlCurrency = e.target.value;
                    setSelectedAccounts(newAccs);
                  }}
                  className="bg-background/50"
                  placeholder="0.00"
                />
              </div>
              {selectedAccounts.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => {
                    const newAccs = [...selectedAccounts];
                    newAccs.splice(index, 1);
                    setSelectedAccounts(newAccs);
                  }}
                >
                  Remove
                </Button>
              )}
            </div>
          ))}

          <div className="pt-4 border-t border-border/30 w-48">
            <div className="space-y-2">
              <Label>R-Multiple (Manual)</Label>
              <Input
                type="number"
                step="any"
                value={pnlR}
                onChange={(e) => setPnlR(e.target.value)}
                className="bg-background/50"
                placeholder="e.g. 2.5"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: Checklist Snapshot */}
      {checklistItems.length > 0 && (
        <section className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">3</span>
            Entry Checklist
            <span className="text-xs text-muted-foreground font-normal ml-2">
              Untick items you did NOT respect
            </span>
          </h2>

          <div className="space-y-2">
            {checklistItems.map((item, idx) => (
              <label
                key={item.id}
                className={`
                  flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer
                  transition-all duration-200
                  ${item.is_respected ? 'bg-profit/5 border border-profit/20' : 'bg-loss/5 border border-loss/20'}
                `}
              >
                <Checkbox
                  checked={item.is_respected}
                  onCheckedChange={(checked) => {
                    setChecklistItems((prev) =>
                      prev.map((i, j) =>
                        j === idx ? { ...i, is_respected: !!checked } : i
                      )
                    );
                  }}
                />
                <span className={`text-sm ${!item.is_respected ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {item.content}
                </span>
              </label>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">
              Adherence: <span className="font-bold text-foreground">
                {checklistItems.length > 0
                  ? Math.round(
                      (checklistItems.filter((i) => i.is_respected).length /
                        checklistItems.length) *
                        100
                    )
                  : 100}
                %
              </span>
            </span>
          </div>
        </section>
      )}

      {/* SECTION 4: Reflection */}
      <section className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {checklistItems.length > 0 ? '4' : '3'}
          </span>
          Reflection
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Pre-Trade Emotional State</Label>
            <div className="flex flex-wrap gap-2">
              {EMOTIONS.map((e) => (
                <button
                  key={e.value}
                  type="button"
                  onClick={() => setEmotionalState(e.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all duration-200
                    ${emotionalState === e.value
                      ? 'bg-primary/20 border border-primary/40 text-foreground'
                      : 'bg-background/30 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-background/50'
                    }
                  `}
                >
                  {e.emoji} {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mistakes</Label>
            <div className="flex flex-wrap gap-2">
              {MISTAKE_TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleMistake(tag)}
                  className={`
                    px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-200
                    ${selectedMistakes.includes(tag)
                      ? 'bg-loss/20 border border-loss/40 text-loss'
                      : 'bg-background/30 border border-border/30 text-muted-foreground hover:text-foreground'
                    }
                  `}
                >
                  {tag.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What went well? What could you improve?"
              rows={4}
              className="bg-background/50 resize-none"
            />
          </div>

          <div className="space-y-3 pt-2">
            <Label>Screenshots</Label>
            <div className="flex flex-wrap gap-3">
              {[...existingScreenshots, ...newScreenshots].map((url, idx) => (
                <div key={idx} className="relative w-32 h-24 rounded-lg overflow-hidden border border-border bg-muted/20 group">
                  <img src={url} alt="Screenshot preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(idx)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              
              <label className="w-32 h-24 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-background/50 hover:border-primary/50 transition-colors text-muted-foreground hover:text-primary">
                <ImagePlus className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Add Images</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Submit */}
      <div className="flex items-center gap-4">
        <Button type="submit" disabled={loading} className="px-8">
          {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
          {trade ? 'Update Trade' : 'Log Trade'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
