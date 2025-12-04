-- Add status column to form_responses table
ALTER TABLE form_responses 
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Create index for faster status queries
CREATE INDEX IF NOT EXISTS idx_form_responses_status ON form_responses(status);

-- Create a table to track status history for analytics
CREATE TABLE IF NOT EXISTS status_history (
  id SERIAL PRIMARY KEY,
  response_id INTEGER NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by INTEGER REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_status_history_response_id ON status_history(response_id);
CREATE INDEX IF NOT EXISTS idx_status_history_new_status ON status_history(new_status);
