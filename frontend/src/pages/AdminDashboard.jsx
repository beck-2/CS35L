import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchForms = () => {
    fetch('/api/forms')
      .then(res => res.json())
      .then(data => {
        setForms(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching forms:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (formId, formName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${formName}"?\n\nThis will permanently delete the form and all its responses. This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(formId);
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to delete form');
      }

      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      alert('Error deleting form. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        Loading...
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ 
              color: '#2d3436', 
              marginBottom: '8px', 
              fontSize: '32px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
            }}>
              Forms
            </h1>
            <p style={{ color: '#636e72', fontSize: '16px', margin: 0 }}>
              Create and manage your application forms
            </p>
          </div>
          <Link to="/admin/forms/new">
            <button style={{
              padding: '12px 24px',
              backgroundColor: '#4D7298',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#77A6B6';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#4D7298';
              e.currentTarget.style.transform = 'translateY(0)';
            }}>
              Create New Form
            </button>
          </Link>
        </div>
        
        {forms.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
            <p style={{ color: '#737373', fontSize: '18px', marginBottom: '8px' }}>No forms yet.</p>
            <p style={{ color: '#a3a3a3', fontSize: '14px' }}>Create your first form to get started!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {forms.map(form => (
              <div 
                key={form.id} 
                style={{ 
                  backgroundColor: 'white',
                  border: '1px solid #f5f5f4',
                  padding: '24px', 
                  borderRadius: '16px',
                  boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(0,0,0,0.1)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 2px 20px rgba(0,0,0,0.06)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <h3 style={{ 
                  color: '#0a0a0a',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  letterSpacing: '-0.01em',
                }}>
                  {form.name}
                </h3>
                <p style={{ 
                  color: '#737373', 
                  fontSize: '14px',
                  marginBottom: '20px',
                }}>
                  Created: {new Date(form.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap',
                  gap: '8px',
                  marginTop: '20px',
                  paddingTop: '20px',
                  borderTop: '1px solid #f5f5f4',
                }}>
                  <Link 
                    to={`/admin/forms/${form.id}/edit`} 
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#9DC3C2',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'inline-block',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#77A6B6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#9DC3C2';
                    }}
                  >
                    Edit
                  </Link>
                  <Link 
                    to={`/admin/forms/${form.id}/responses`} 
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#77A6B6',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'inline-block',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#4D7298';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#77A6B6';
                    }}
                  >
                    View Responses
                  </Link>
                  <a 
                    href={`/apply/${form.public_id}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{ 
                      padding: '8px 16px',
                      backgroundColor: '#84BF5F',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      display: 'inline-block',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = '0.9';
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = '1';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    Public Link
                  </a>
                  <button
                    onClick={() => handleDelete(form.id, form.name)}
                    disabled={deleting === form.id}
                    style={{
                      padding: '8px 16px',
                      color: '#dc3545',
                      background: 'none',
                      border: '1px solid #f5f5f4',
                      borderRadius: '6px',
                      cursor: deleting === form.id ? 'not-allowed' : 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (deleting !== form.id) {
                        e.currentTarget.style.backgroundColor = '#fee';
                        e.currentTarget.style.borderColor = '#dc3545';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderColor = '#f5f5f4';
                    }}
                  >
                    {deleting === form.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

