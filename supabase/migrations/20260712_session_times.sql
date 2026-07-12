-- Add start_time and end_time to trading_sessions
ALTER TABLE public.trading_sessions 
ADD COLUMN start_time TIME,
ADD COLUMN end_time TIME;
