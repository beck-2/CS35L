-- Add user_id to events table for multi-user support
-- This allows each user to have their own set of timeline events

ALTER TABLE events 
ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);

-- Note: Existing events will have NULL user_id
-- They should be manually assigned or deleted if not needed
