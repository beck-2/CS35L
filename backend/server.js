import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db/connection.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/db/test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'connected', time: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/files', async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'filename and content required' });
    }
    const result = await pool.query(
      'INSERT INTO files (filename, content) VALUES ($1, $2) RETURNING id, filename, created_at',
      [filename, content]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, filename, created_at FROM files ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, filename, content, created_at FROM files WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/files/pdf', async (req, res) => {
  try {
    const { filename, content } = req.body;
    if (!filename || !content) {
      return res.status(400).json({ error: 'filename and content (base64) required' });
    }
    const result = await pool.query(
      'INSERT INTO files (filename, content) VALUES ($1, $2) RETURNING id, filename, created_at',
      [filename, content]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

app.get('/api/forms', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, public_id, created_at, updated_at FROM forms ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM forms WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/forms/public/:publicId', async (req, res) => {
  try {
    const { publicId } = req.params;
    const result = await pool.query(
      'SELECT id, name, public_id, definition, created_at FROM forms WHERE public_id = $1',
      [publicId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/forms', async (req, res) => {
  try {
    const { name, definition } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const publicId = generateId();
    const adminId = 'admin_' + generateId();

    const result = await pool.query(
      `INSERT INTO forms (name, public_id, admin_id, definition) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, name, public_id, admin_id, definition, created_at, updated_at`,
      [name, publicId, adminId, JSON.stringify(definition || { fields: [] })]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;

    const result = await pool.query(
      `UPDATE forms 
       SET name = COALESCE($1, name), 
           definition = COALESCE($2::jsonb, definition),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3
       RETURNING *`,
      [name, definition ? JSON.stringify(definition) : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/forms/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM forms WHERE id = $1 RETURNING id, name',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    res.json({ message: 'Form deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/forms/:id/responses', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT id, form_id, response_data, submitted_at, applicant_name, applicant_email
       FROM form_responses 
       WHERE form_id = $1 
       ORDER BY submitted_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/forms/public/:publicId/submit', async (req, res) => {
  try {
    const { publicId } = req.params;
    const { response_data, applicant_name, applicant_email } = req.body;

    const formResult = await pool.query(
      'SELECT id FROM forms WHERE public_id = $1',
      [publicId]
    );

    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const formId = formResult.rows[0].id;

    const processedData = { ...response_data };
    const fileReferences = {};

    for (const [key, value] of Object.entries(response_data)) {
      if (typeof value === 'string' && value.startsWith('data:')) {
        const base64Data = value;
        const matches = base64Data.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) {
          const mimeType = matches[1];
          const base64Content = matches[2];
          const filename = `upload_${Date.now()}_${key}.${mimeType.split('/')[1] || 'bin'}`;
          
          const fileResult = await pool.query(
            'INSERT INTO files (filename, content) VALUES ($1, $2) RETURNING id',
            [filename, base64Content]
          );
          
          fileReferences[key] = fileResult.rows[0].id;
          processedData[key] = `file:${fileResult.rows[0].id}`;
        }
      }
    }

    const result = await pool.query(
      `INSERT INTO form_responses (form_id, response_data, applicant_name, applicant_email)
       VALUES ($1, $2, $3, $4)
       RETURNING id, form_id, submitted_at`,
      [formId, JSON.stringify(processedData), applicant_name || null, applicant_email || null]
    );

    res.json({ ...result.rows[0], file_references: fileReferences });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM events ORDER BY position ASC, id ASC'
    );
    
    const acceptanceEvent = result.rows.find(e => e.name === 'Acceptance');
    const nonAcceptanceEvents = result.rows.filter(e => e.name !== 'Acceptance');
    
    const sortedEvents = [...nonAcceptanceEvents];
    if (acceptanceEvent) {
      sortedEvents.push(acceptanceEvent);
    }
    
    res.json(sortedEvents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events', async (req, res) => {
  try {
    const { name, event_date, position } = req.body;
    if (!name || !event_date) {
      return res.status(400).json({ error: 'name and event_date are required' });
    }

    const result = await pool.query(
      `INSERT INTO events (name, event_date, position, is_system)
       VALUES ($1, $2, $3, FALSE)
       RETURNING *`,
      [name, event_date, position || 1]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, event_date, position } = req.body;

    const eventCheck = await pool.query('SELECT is_system FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (eventCheck.rows[0].is_system) {
      return res.status(403).json({ error: 'System events cannot be modified' });
    }

    const result = await pool.query(
      `UPDATE events 
       SET name = COALESCE($1, name),
           event_date = COALESCE($2::date, event_date),
           position = COALESCE($3, position),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, event_date, position, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/reorder', async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'events array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      let maxPosition = Math.max(...events.map(e => e.position));
      
      for (const event of events) {
        const eventCheck = await client.query('SELECT name FROM events WHERE id = $1', [event.id]);
        const eventName = eventCheck.rows[0]?.name;
        
        if (eventName === 'Acceptance') {
          await client.query(
            'UPDATE events SET position = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [maxPosition, event.id]
          );
        } else {
          await client.query(
            'UPDATE events SET position = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [event.position, event.id]
          );
        }
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Events reordered successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND is_system = FALSE RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found or cannot be deleted' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events/:id/form', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT form_id FROM events WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const formId = result.rows[0].form_id;
    if (!formId) {
      return res.json({ form_id: null });
    }

    const formResult = await pool.query(
      'SELECT * FROM forms WHERE id = $1',
      [formId]
    );
    res.json({ form_id: formId, form: formResult.rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/form', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, definition } = req.body;

    const eventResult = await pool.query(
      'SELECT form_id FROM events WHERE id = $1',
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const existingFormId = eventResult.rows[0].form_id;

    if (existingFormId) {
      const formResult = await pool.query(
        'SELECT * FROM forms WHERE id = $1',
        [existingFormId]
      );
      return res.json(formResult.rows[0]);
    }

    const publicId = generateId();
    const adminId = 'admin_' + generateId();
    const formName = name || 'Application Form';

    const formResult = await pool.query(
      `INSERT INTO forms (name, public_id, admin_id, definition) 
       VALUES ($1, $2, $3, $4) 
       RETURNING *`,
      [formName, publicId, adminId, JSON.stringify(definition || { fields: [] })]
    );

    await pool.query(
      'UPDATE events SET form_id = $1 WHERE id = $2',
      [formResult.rows[0].id, id]
    );

    res.json(formResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

