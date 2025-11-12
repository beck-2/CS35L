CREATE TABLE IF NOT EXISTS forms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  public_id VARCHAR(50) UNIQUE NOT NULL,
  admin_id VARCHAR(50) UNIQUE NOT NULL,
  definition JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS form_responses (
  id SERIAL PRIMARY KEY,
  form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  response_data JSONB NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applicant_name VARCHAR(255),
  applicant_email VARCHAR(255)
);

CREATE INDEX idx_form_responses_form_id ON form_responses(form_id);
CREATE INDEX idx_form_responses_submitted_at ON form_responses(submitted_at DESC);

