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
          borderRadius: '20px',
          padding: '36px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0',
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block',
                color: '#0a0a0a',
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '10px',
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
                  padding: '14px 18px',
                  fontSize: '16px',
                  border: '2px solid #e5e5e5',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#9DC3C2';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(157,195,194,0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '14px', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                onClick={() => navigate('/admin')}
                style={{ 
                  padding: '14px 28px',
                  backgroundColor: 'white',
                  color: '#737373',
                  border: '2px solid #e5e5e5',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#9DC3C2';
                  e.currentTarget.style.color = '#4D7298';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e5e5';
                  e.currentTarget.style.color = '#737373';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={saving}
                style={{
                  padding: '14px 28px',
                  backgroundColor: saving ? '#9DC3C2' : '#4D7298',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s ease',
                  opacity: saving ? 0.7 : 1,
                  boxShadow: saving ? 'none' : '0 2px 8px rgba(77, 114, 152, 0.2)',
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = '#77A6B6';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(77, 114, 152, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.backgroundColor = '#4D7298';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(77, 114, 152, 0.2)';
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

