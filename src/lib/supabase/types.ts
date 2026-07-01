// ============================================================
// TradeOps: Database Types
// Generated from schema — keep in sync with migrations
// ============================================================

export type AccountPhase = 'eval_p1' | 'eval_p2' | 'funded' | 'passed' | 'failed';
export type TradeDirection = 'long' | 'short';
export interface TradingSession {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}
export type TradeStatus = 'open' | 'closed' | 'cancelled';
export type EmotionalState = 'calm' | 'confident' | 'anxious' | 'fomo' | 'revenge' | 'tired' | 'neutral';
export type MistakeTag =
  | 'moved_sl'
  | 'no_confirmation'
  | 'oversize'
  | 'fomo'
  | 'revenge'
  | 'cut_winner_early'
  | 'held_loser_too_long'
  | 'traded_news'
  | 'broke_setup_rules'
  | 'chasing';

export type GoalStatus = 'active' | 'completed' | 'abandoned';

// ---- Row Types ----

export interface Account {
  id: string;
  user_id: string;
  provider_name: string;
  nickname: string | null;
  account_size: number;
  challenge_fee: number;
  phase: AccountPhase;
  position: number;
  created_at: string;
  updated_at: string;
  funded_at: string | null;
  failed_at: string | null;
}

export interface Setup {
  id: string;
  user_id: string;
  name: string;
  description: string;
  is_archived: boolean;
  color_code: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  setup_id: string;
  content: string;
  position: number;
  created_at: string;
}

export interface Trade {
  id: string;
  user_id: string;
  setup_id: string | null;
  instrument: string;
  direction: TradeDirection;
  session_id: string | null;
  entry_price: number | null;
  stop_loss: number | null;
  take_profit: number | null;
  exit_price: number | null;
  planned_rr: number | null;
  executed_rr: number | null;
  pnl_r: number | null;
  status: TradeStatus;
  entry_time: string | null;
  exit_time: string | null;
  emotional_state: EmotionalState;
  notes: string;
  screenshot_urls: string[];
  adherence_pct: number;
  mistake_tags: MistakeTag[];
  created_at: string;
}

export interface TradeChecklistItem {
  id: string;
  trade_id: string;
  content: string;
  is_respected: boolean;
  position: number;
}

export interface TradeExecution {
  id: string;
  trade_id: string;
  account_id: string;
  pnl_currency: number;
  lot_size: number | null;
  fees: number;
  created_at: string;
}

export interface Payout {
  id: string;
  account_id: string | null;
  user_id: string;
  amount: number;
  split_percentage: number;
  payout_date: string;
  notes: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: GoalStatus;
  target_date: string | null;
  created_at: string;
  completed_at: string | null;
}

export interface MindDump {
  id: string;
  user_id: string;
  dump_date: string;
  content: string;
  image_urls?: string[] | null;
  created_at: string;
}

// ---- Insert Types ----

export type AccountInsert = Omit<Account, 'id' | 'created_at' | 'updated_at'>;
export type SetupInsert = Omit<Setup, 'id' | 'created_at'>;
export type ChecklistItemInsert = Omit<ChecklistItem, 'id' | 'created_at'>;
export type TradeInsert = Omit<Trade, 'id' | 'created_at'>;
export type TradeChecklistItemInsert = Omit<TradeChecklistItem, 'id'>;
export type PayoutInsert = Omit<Payout, 'id' | 'created_at'>;
export type GoalInsert = Omit<Goal, 'id' | 'created_at' | 'completed_at'>;
export type MindDumpInsert = Omit<MindDump, 'id' | 'created_at'>;

// ---- Update Types ----

export type AccountUpdate = Partial<Omit<Account, 'id' | 'user_id' | 'created_at'>>;
export type SetupUpdate = Partial<Omit<Setup, 'id' | 'user_id' | 'created_at'>>;
export type TradeUpdate = Partial<Omit<Trade, 'id' | 'user_id' | 'created_at'>>;
export type GoalUpdate = Partial<Omit<Goal, 'id' | 'user_id' | 'created_at'>>;

// ---- Joined Types ----

export interface TradeWithRelations extends Trade {
  setup?: Setup | null;
  session?: TradingSession | null;
  trade_checklist_items?: TradeChecklistItem[];
  trade_executions?: TradeExecution[];
  // Dynamic fields injected by the frontend for specific views/stats
  pnl_currency?: number;
  account_id?: string;
}

export interface SetupWithChecklist extends Setup {
  checklist_items: ChecklistItem[];
}

export interface SetupWithStats extends Setup {
  checklist_items: ChecklistItem[];
  trade_count: number;
  win_rate: number;
  avg_r: number;
  avg_adherence: number;
}

export interface AccountWithPayouts extends Account {
  payouts: Payout[];
  total_payouts: number;
  net_result: number;
}

// ---- Server Action Result ----

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };
