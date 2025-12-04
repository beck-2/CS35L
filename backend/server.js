import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import pool from './db/connection.js';
import { generateResponsesCSV, generateExportFilename } from './services/exportService.js';
import authRoutes from './routes/auth.js';
import { attachUser } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration to allow credentials
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Attach user info to all requests
app.use(attachUser);

// Auth routes
app.use('/api/auth', authRoutes);

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
    
    const file = result.rows[0];
    const base64Content = file.content;
    const buffer = Buffer.from(base64Content, 'base64');
    
    // Determine content type from filename
    const ext = file.filename.split('.').pop().toLowerCase();
    const contentTypeMap = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Set headers for inline viewing (not forcing download)
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${file.filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/files/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, filename, content, created_at FROM files WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const file = result.rows[0];
    const base64Content = file.content;
    const buffer = Buffer.from(base64Content, 'base64');
    
    // Determine content type from filename
    const ext = file.filename.split('.').pop().toLowerCase();
    const contentTypeMap = {
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'txt': 'text/plain',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';
    
    // Force download
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.setHeader('Content-Length', buffer.length);
    
    res.send(buffer);
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
    // Only return forms for the logged-in user
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await pool.query(
      'SELECT id, name, public_id, created_at, updated_at FROM forms WHERE user_id = $1 ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/forms/:id', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM forms WHERE id = $1 AND user_id = $2',
      [id, req.userId]
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
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { name, definition } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'name is required' });
    }

    const publicId = generateId();
    const adminId = 'admin_' + generateId();

    const result = await pool.query(
      `INSERT INTO forms (name, public_id, admin_id, definition, user_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, public_id, admin_id, definition, created_at, updated_at`,
      [name, publicId, adminId, JSON.stringify(definition || { fields: [] }), req.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/forms/:id', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const { name, definition } = req.body;

    const result = await pool.query(
      `UPDATE forms 
       SET name = COALESCE($1, name), 
           definition = COALESCE($2::jsonb, definition),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [name, definition ? JSON.stringify(definition) : null, id, req.userId]
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
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM forms WHERE id = $1 AND user_id = $2 RETURNING id, name',
      [id, req.userId]
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
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;
    
    // First verify the form belongs to the user
    const formCheck = await pool.query(
      'SELECT id FROM forms WHERE id = $1 AND user_id = $2',
      [id, req.userId]
    );
    
    if (formCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }
    
    const result = await pool.query(
      `SELECT id, form_id, response_data, submitted_at, applicant_name, applicant_email, status
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

// Rating endpoints
app.post('/api/responses/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewer_name, reviewer_email, rating, comment } = req.body;

    if (!reviewer_name || !rating) {
      return res.status(400).json({ error: 'reviewer_name and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const result = await pool.query(
      `INSERT INTO ratings (response_id, reviewer_name, reviewer_email, rating, comment)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id, reviewer_name, reviewer_email || null, rating, comment || null]
    );

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/responses/:id/ratings', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT * FROM ratings
       WHERE response_id = $1
       ORDER BY created_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/responses/:id/ratings/average', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        COALESCE(AVG(rating), 0) as average,
        COUNT(*) as count
       FROM ratings
       WHERE response_id = $1`,
      [id]
    );
    res.json({
      average: parseFloat(result.rows[0].average).toFixed(1),
      count: parseInt(result.rows[0].count)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update applicant status (accept/reject/pending)
app.patch('/api/responses/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const userId = req.session?.userId;

    // Valid statuses for now: pending, accepted, rejected
    const validStatuses = ['pending', 'accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Get current status
    const currentResult = await pool.query(
      'SELECT status FROM form_responses WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Response not found' });
    }

    const previousStatus = currentResult.rows[0].status;

    // Update status
    const updateResult = await pool.query(
      'UPDATE form_responses SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    // Record status change in history
    await pool.query(
      `INSERT INTO status_history (response_id, previous_status, new_status, changed_by, notes)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, previousStatus, status, userId, notes || null]
    );

    res.json(updateResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get status history for a response
app.get('/api/responses/:id/status-history', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT sh.*, u.username as changed_by_username
       FROM status_history sh
       LEFT JOIN users u ON sh.changed_by = u.id
       WHERE sh.response_id = $1
       ORDER BY sh.changed_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/forms/:id/responses/export', async (req, res) => {
  try {
    const { id } = req.params;

    const formResult = await pool.query(
      'SELECT id, name, definition FROM forms WHERE id = $1',
      [id]
    );

    if (formResult.rows.length === 0) {
      return res.status(404).json({ error: 'Form not found' });
    }

    const form = formResult.rows[0];

    const responsesResult = await pool.query(
      `SELECT id, form_id, response_data, submitted_at, applicant_name, applicant_email
       FROM form_responses
       WHERE form_id = $1
       ORDER BY submitted_at DESC`,
      [id]
    );

    const ratingsResult = await pool.query(
      `SELECT
         response_id,
         AVG(rating) as avg_rating,
         COUNT(*) as review_count
       FROM ratings
       WHERE response_id IN (
         SELECT id FROM form_responses WHERE form_id = $1
       )
       GROUP BY response_id`,
      [id]
    );

    const ratingsMap = {};
    ratingsResult.rows.forEach(row => {
      ratingsMap[row.response_id] = {
        avg_rating: parseFloat(row.avg_rating),
        review_count: parseInt(row.review_count)
      };
    });

    const csvContent = generateResponsesCSV(form, responsesResult.rows, ratingsMap);
    const filename = generateExportFilename(form.name);
    const csvWithBOM = '\uFEFF' + csvContent;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvWithBOM);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/events', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const result = await pool.query(
      'SELECT * FROM events WHERE user_id = $1 ORDER BY position ASC, id ASC',
      [req.userId]
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
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { name, event_date, position, notes, members_only, location } = req.body;
    if (!name || !event_date) {
      return res.status(400).json({ error: 'name and event_date are required' });
    }

    const result = await pool.query(
      `INSERT INTO events (name, event_date, position, is_system, notes, members_only, location, user_id)
       VALUES ($1, $2, $3, FALSE, $4, $5, $6, $7)
       RETURNING *`,
      [name, event_date, position || 1, notes || null, members_only || false, location || null, req.userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/:id', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const { name, event_date, position, notes, members_only, location } = req.body;

    const eventCheck = await pool.query('SELECT is_system, user_id FROM events WHERE id = $1', [id]);
    if (eventCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event belongs to user
    if (eventCheck.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (eventCheck.rows[0].is_system) {
      return res.status(403).json({ error: 'System events cannot be modified' });
    }

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (event_date !== undefined) {
      updates.push(`event_date = $${paramIndex}::date`);
      values.push(event_date);
      paramIndex++;
    }

    if (position !== undefined) {
      updates.push(`position = $${paramIndex}`);
      values.push(position);
      paramIndex++;
    }

    if (notes !== undefined) {
      updates.push(`notes = $${paramIndex}`);
      values.push(notes === '' ? null : notes);
      paramIndex++;
    }

    if (members_only !== undefined) {
      updates.push(`members_only = $${paramIndex}`);
      values.push(members_only);
      paramIndex++;
    }

    if (location !== undefined) {
      updates.push(`location = $${paramIndex}`);
      values.push(location === '' ? null : location);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await pool.query(
      `UPDATE events 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/events/reorder', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { events } = req.body;
    if (!Array.isArray(events)) {
      return res.status(400).json({ error: 'events array is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      let maxPosition = Math.max(...events.map(e => e.position));
      
      for (const event of events) {
        // Verify event belongs to user
        const eventCheck = await client.query('SELECT name, user_id FROM events WHERE id = $1', [event.id]);
        if (eventCheck.rows.length === 0 || eventCheck.rows[0].user_id !== req.userId) {
          await client.query('ROLLBACK');
          return res.status(403).json({ error: 'Access denied' });
        }
        
        const eventName = eventCheck.rows[0]?.name;
        
        if (eventName === 'Acceptance') {
          await client.query(
            'UPDATE events SET position = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
            [maxPosition, event.id, req.userId]
          );
        } else {
          await client.query(
            'UPDATE events SET position = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3',
            [event.position, event.id, req.userId]
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
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM events WHERE id = $1 AND is_system = FALSE AND user_id = $2 RETURNING id',
      [id, req.userId]
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
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const result = await pool.query(
      'SELECT form_id, user_id FROM events WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event belongs to user
    if (result.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const formId = result.rows[0].form_id;
    if (!formId) {
      return res.json({ form_id: null });
    }

    const formResult = await pool.query(
      'SELECT * FROM forms WHERE id = $1 AND user_id = $2',
      [formId, req.userId]
    );
    res.json({ form_id: formId, form: formResult.rows[0] || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/events/:id/form', async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { id } = req.params;
    const { name, definition } = req.body;

    const eventResult = await pool.query(
      'SELECT form_id, user_id FROM events WHERE id = $1',
      [id]
    );

    if (eventResult.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event belongs to user
    if (eventResult.rows[0].user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const existingFormId = eventResult.rows[0].form_id;

    if (existingFormId) {
      const formResult = await pool.query(
        'SELECT * FROM forms WHERE id = $1 AND user_id = $2',
        [existingFormId, req.userId]
      );
      return res.json(formResult.rows[0]);
    }

    const publicId = generateId();
    const adminId = 'admin_' + generateId();
    const formName = name || 'Application Form';

    const formResult = await pool.query(
      `INSERT INTO forms (name, public_id, admin_id, definition, user_id) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [formName, publicId, adminId, JSON.stringify(definition || { fields: [] }), req.userId]
    );

    await pool.query(
      'UPDATE events SET form_id = $1 WHERE id = $2 AND user_id = $3',
      [formResult.rows[0].id, id, req.userId]
    );

    res.json(formResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

