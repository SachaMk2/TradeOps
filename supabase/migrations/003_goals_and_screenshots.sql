-- Add screenshot_urls to trades
ALTER TABLE trades
ADD COLUMN screenshot_urls text[] DEFAULT '{}'::text[];

-- Migrate any existing screenshot_url to the new array column (optional, but good practice)
UPDATE trades
SET screenshot_urls = ARRAY[screenshot_url]
WHERE screenshot_url IS NOT NULL;

ALTER TABLE trades
DROP COLUMN screenshot_url;

-- Create goals table
CREATE TABLE goals (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
    target_date timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    completed_at timestamp with time zone
);

-- RLS for goals
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own goals" ON goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own goals" ON goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON goals
    FOR DELETE USING (auth.uid() = user_id);
