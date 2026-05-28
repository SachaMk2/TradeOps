-- Add split_percentage to payouts
ALTER TABLE payouts
ADD COLUMN split_percentage integer NOT NULL DEFAULT 80;
