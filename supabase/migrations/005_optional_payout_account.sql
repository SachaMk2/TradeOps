-- Make account_id optional in payouts table
ALTER TABLE payouts ALTER COLUMN account_id DROP NOT NULL;
