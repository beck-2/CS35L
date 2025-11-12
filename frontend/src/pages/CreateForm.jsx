import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateForm() {
  const [formName, setFormName] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setSaving(true);
    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          definition: { fields: [] }
        })
      });
      const form = await response.json();
      navigate(`/admin/forms/${form.id}/edit`);
    } catch (error) {
      console.error('Error creating form:', error);
      setSaving(false);
    }
  };

  return (
    <div>
      <h1>Create New Form</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Form Name:
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="e.g., Software Engineer Application"
            required
          />
        </label>
        <button type="submit" disabled={saving}>
          {saving ? 'Creating...' : 'Create Form'}
        </button>
      </form>
      <button onClick={() => navigate('/admin')}>Cancel</button>
    </div>
  );
}

export default CreateForm;

