-- Create trading_sessions table
CREATE TABLE trading_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE trading_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own sessions"
  ON trading_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add session_id to trades
ALTER TABLE trades ADD COLUMN session_id UUID REFERENCES trading_sessions(id) ON DELETE SET NULL;

-- Remove the old hardcoded session column and enum
ALTER TABLE trades DROP COLUMN session;
DROP TYPE IF EXISTS trade_session CASCADE;
