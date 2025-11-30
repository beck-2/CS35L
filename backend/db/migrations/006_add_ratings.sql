CREATE TABLE IF NOT EXISTS ratings (
  id SERIAL PRIMARY KEY,
  response_id INTEGER NOT NULL REFERENCES form_responses(id) ON DELETE CASCADE,
  reviewer_name VARCHAR(255) NOT NULL,
  reviewer_email VARCHAR(255),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ratings_response_id ON ratings(response_id);
