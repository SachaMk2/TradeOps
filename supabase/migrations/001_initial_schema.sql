-- ============================================================
-- TradeOps: Full Database Schema
-- ============================================================

-- 1. ENUMS
-- ============================================================

CREATE TYPE account_phase AS ENUM (
  'eval_p1',
  'eval_p2',
  'funded',
  'passed',
  'failed'
);

CREATE TYPE trade_direction AS ENUM ('long', 'short');

CREATE TYPE trade_session AS ENUM (
  'asia',
  'london',
  'new_york',
  'asia_london_overlap',
  'london_ny_overlap'
);

CREATE TYPE trade_status AS ENUM ('open', 'closed', 'cancelled');

CREATE TYPE emotional_state AS ENUM (
  'calm',
  'confident',
  'anxious',
  'fomo',
  'revenge',
  'tired',
  'neutral'
);

CREATE TYPE mistake_tag AS ENUM (
  'moved_sl',
  'no_confirmation',
  'oversize',
  'fomo',
  'revenge',
  'cut_winner_early',
  'held_loser_too_long',
  'traded_news',
  'broke_setup_rules',
  'chasing'
);


-- 2. TABLES
-- ============================================================

-- ACCOUNTS: Prop firm challenge accounts
CREATE TABLE accounts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  nickname      TEXT,
  account_size  NUMERIC NOT NULL DEFAULT 0,
  challenge_fee NUMERIC NOT NULL DEFAULT 0,
  phase         account_phase NOT NULL DEFAULT 'eval_p1',
  position      INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  funded_at     TIMESTAMPTZ,
  failed_at     TIMESTAMPTZ
);

-- SETUPS: Trading strategy playbooks
CREATE TABLE setups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_archived BOOLEAN NOT NULL DEFAULT false,
  color_code  TEXT NOT NULL DEFAULT '#6366f1',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CHECKLIST_ITEMS: Conditions for each setup
CREATE TABLE checklist_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setup_id   UUID NOT NULL REFERENCES setups(id) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRADES: Individual trade entries
CREATE TABLE trades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id      UUID REFERENCES accounts(id) ON DELETE SET NULL,
  setup_id        UUID REFERENCES setups(id) ON DELETE SET NULL,
  instrument      TEXT NOT NULL,
  direction       trade_direction NOT NULL,
  session         trade_session NOT NULL DEFAULT 'london',
  entry_price     NUMERIC,
  stop_loss       NUMERIC,
  take_profit     NUMERIC,
  exit_price      NUMERIC,
  lot_size        NUMERIC,
  fees            NUMERIC NOT NULL DEFAULT 0,
  planned_rr      NUMERIC,
  executed_rr     NUMERIC,
  pnl_currency    NUMERIC NOT NULL DEFAULT 0,
  pnl_r           NUMERIC,
  status          trade_status NOT NULL DEFAULT 'open',
  entry_time      TIMESTAMPTZ,
  exit_time       TIMESTAMPTZ,
  emotional_state emotional_state DEFAULT 'neutral',
  notes           TEXT DEFAULT '',
  screenshot_url  TEXT,
  adherence_pct   NUMERIC NOT NULL DEFAULT 100,
  mistake_tags    mistake_tag[] DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TRADE_CHECKLIST_ITEMS: Frozen checklist snapshots per trade
CREATE TABLE trade_checklist_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id     UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  content      TEXT NOT NULL,
  is_respected BOOLEAN NOT NULL DEFAULT true,
  position     INTEGER NOT NULL DEFAULT 0
);

-- PAYOUTS: Withdrawal records per account
CREATE TABLE payouts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id  UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount      NUMERIC NOT NULL DEFAULT 0,
  payout_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes       TEXT DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- 3. INDEXES
-- ============================================================

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_phase ON accounts(user_id, phase);
CREATE INDEX idx_setups_user_id ON setups(user_id);
CREATE INDEX idx_checklist_items_setup ON checklist_items(setup_id);
CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_account ON trades(account_id);
CREATE INDEX idx_trades_setup ON trades(setup_id);
CREATE INDEX idx_trades_created ON trades(user_id, created_at DESC);
CREATE INDEX idx_trade_checklist_trade ON trade_checklist_items(trade_id);
CREATE INDEX idx_payouts_account ON payouts(account_id);
CREATE INDEX idx_payouts_user ON payouts(user_id);


-- 4. TRIGGERS: Auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();


-- 5. ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;

-- ACCOUNTS policies
CREATE POLICY "Users manage own accounts"
  ON accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SETUPS policies
CREATE POLICY "Users manage own setups"
  ON setups FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CHECKLIST_ITEMS policies (via setup ownership)
CREATE POLICY "Users manage own checklist items"
  ON checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM setups
      WHERE setups.id = checklist_items.setup_id
      AND setups.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM setups
      WHERE setups.id = checklist_items.setup_id
      AND setups.user_id = auth.uid()
    )
  );

-- TRADES policies
CREATE POLICY "Users manage own trades"
  ON trades FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- TRADE_CHECKLIST_ITEMS policies (via trade ownership)
CREATE POLICY "Users manage own trade checklist items"
  ON trade_checklist_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_checklist_items.trade_id
      AND trades.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_checklist_items.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- PAYOUTS policies
CREATE POLICY "Users manage own payouts"
  ON payouts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- 6. STORAGE BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('trade-screenshots', 'trade-screenshots', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users upload own screenshots"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users read own screenshots"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'trade-screenshots'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Public read screenshots"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'trade-screenshots');
