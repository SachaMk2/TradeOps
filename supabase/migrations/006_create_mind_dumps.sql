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
