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
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#2d3436', 
            marginBottom: '8px', 
            fontSize: '32px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
          }}>
            Create New Form
          </h1>
          <p style={{ color: '#636e72', fontSize: '16px', margin: 0 }}>
            Start building your application form
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          border: '1px solid #f5f5f4',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                color: '#0a0a0a',
                fontSize: '16px',
                fontWeight: '500',
                marginBottom: '8px',
              }}>
                Form Name
              </label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Software Engineer Application"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '16px',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#9DC3C2';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(157,195,194,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => navigate('/admin')}
                style={{ 
                  padding: '12px 24px',
                  backgroundColor: 'white',
                  color: '#737373',
                  border: '1px solid #e5e5e5',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9DC3C2';
                  e.currentTarget.style.color = '#4D7298';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.color = '#737373';
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  backgroundColor: saving ? '#9DC3C2' : '#4D7298',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = '#77A6B6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = '#4D7298';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {saving ? 'Creating...' : 'Create Form'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateForm;

