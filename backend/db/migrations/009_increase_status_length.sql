-- Increase status column length to accommodate longer stage names
ALTER TABLE form_responses 
ALTER COLUMN status TYPE VARCHAR(100);

-- Update status_history table to match
ALTER TABLE status_history 
ALTER COLUMN previous_status TYPE VARCHAR(100),
ALTER COLUMN new_status TYPE VARCHAR(100);
