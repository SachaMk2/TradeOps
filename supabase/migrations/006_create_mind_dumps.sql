-- Migration: 006_create_mind_dumps.sql
-- Create mind_dumps table to store user thoughts, journal notes, and daily insights.

CREATE TABLE mind_dumps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    dump_date DATE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_mind_dumps_user_date ON mind_dumps(user_id, dump_date DESC);

-- Enable RLS
ALTER TABLE mind_dumps ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can insert their own mind dumps" 
    ON mind_dumps FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own mind dumps" 
    ON mind_dumps FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own mind dumps" 
    ON mind_dumps FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mind dumps" 
    ON mind_dumps FOR DELETE 
    USING (auth.uid() = user_id);
