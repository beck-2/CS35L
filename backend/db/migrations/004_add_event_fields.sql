-- Add notes and members_only fields to events table
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS members_only BOOLEAN DEFAULT FALSE;

