CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  event_date DATE NOT NULL,
  position INTEGER NOT NULL,
  is_system BOOLEAN DEFAULT FALSE,
  form_id INTEGER REFERENCES forms(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_position ON events(position);
CREATE INDEX idx_events_date ON events(event_date);

-- Insert default system events
INSERT INTO events (name, event_date, position, is_system) VALUES
  ('Application', CURRENT_DATE, 1, TRUE),
  ('Acceptance', CURRENT_DATE + INTERVAL '30 days', 2, TRUE)
ON CONFLICT DO NOTHING;

