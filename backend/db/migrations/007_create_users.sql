-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add user_id to forms table to associate forms with users
ALTER TABLE forms ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Add user_id to events table to associate events with users
ALTER TABLE events ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_forms_user_id ON forms(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
