-- Migration: Many-to-Many Trades

-- 1. Create trade_executions table
CREATE TABLE trade_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  pnl_currency NUMERIC(10, 2) NOT NULL DEFAULT 0,
  lot_size NUMERIC(10, 2),
  fees NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE trade_executions ENABLE ROW LEVEL SECURITY;

-- 3. Create Policy
CREATE POLICY "Users manage own trade executions"
  ON trade_executions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_executions.trade_id
      AND trades.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM trades
      WHERE trades.id = trade_executions.trade_id
      AND trades.user_id = auth.uid()
    )
  );

-- 4. Migrate existing data
INSERT INTO trade_executions (trade_id, account_id, pnl_currency, lot_size, fees)
SELECT id, account_id, pnl_currency, lot_size, fees
FROM trades
WHERE account_id IS NOT NULL;

-- 5. Drop old columns from trades
ALTER TABLE trades 
DROP COLUMN account_id,
DROP COLUMN pnl_currency,
DROP COLUMN lot_size,
DROP COLUMN fees;

-- 6. Add indexes
CREATE INDEX idx_trade_executions_trade ON trade_executions(trade_id);
CREATE INDEX idx_trade_executions_account ON trade_executions(account_id);
