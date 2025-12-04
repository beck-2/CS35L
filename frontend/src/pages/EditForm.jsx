import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedField, setSelectedField] = useState(null);
  const [fields, setFields] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [copyStatus, setCopyStatus] = useState('idle');
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        const formFields = data.definition?.fields || [];
        setFields(formFields);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching form:', err);
        setLoading(false);
      });
  }, [id]);

  const addField = (type) => {
    const questionNumber = fields.length + 1;
    const newField = {
      id: `field_${Date.now()}`,
      type,
      label: '',
      description: `Question ${questionNumber}`,
      required: false,
      ...(type === 'radio' || type === 'checkbox' ? { options: ['Option 1'] } : {}),
      ...(type === 'file' ? { accept: '.pdf,.doc,.docx' } : {}),
      ...(type === 'email' ? { validation: '^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$' } : {}),
      ...(type === 'gpa' ? { validation: '^(?:[0-4]\\.\\d{1,3}|5\\.0{1,3})$' } : {})
    };
    setFields([...fields, newField]);
    setSelectedField(newField.id);
  };

  const updateField = (fieldId, updates) => {
    setFields(fields.map(f => 
      f.id === fieldId ? { ...f, ...updates } : f
    ));
  };

  const deleteField = (fieldId) => {
    setFields(fields.filter(f => f.id !== fieldId));
    if (selectedField === fieldId) {
      setSelectedField(null);
    }
  };

  const moveField = (fieldId, direction) => {
    const index = fields.findIndex(f => f.id === fieldId);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= fields.length) return;

    const newFields = [...fields];
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setFields(newFields);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/forms/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          definition: { fields }
        })
      });
      const updated = await response.json();
      setForm(updated);
      setShowSaveNotification(true);
      setTimeout(() => setShowSaveNotification(false), 3000);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form');
    } finally {
      setSaving(false);
    }
  };

  const handleViewResponses = () => {
    navigate(`/admin/forms/${id}/responses`);
  };

  const publicLink = (typeof window !== 'undefined' && form?.public_id)
    ? `${window.location.origin}/apply/${form.public_id}`
    : '';

  const closePublishModal = () => {
    setShowPublishModal(false);
    setCopyStatus('idle');
  };

  const handleCopyPublicLink = async () => {
    if (!publicLink) {
      setCopyStatus('error');
      return;
    }

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(publicLink);
      } else {
        const tempInput = document.createElement('input');
        tempInput.value = publicLink;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }
      setCopyStatus('copied');
    } catch (error) {
      console.error('Error copying link:', error);
      setCopyStatus('error');
    }
  };

  if (loading) return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        Loading...
      </div>
    </div>
  );
  if (!form) return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        Form not found
      </div>
    </div>
  );

  const selectedFieldData = fields.find(f => f.id === selectedField);

  const renderPreviewField = (field, index) => {
    const fieldName = field.id || `field_${index}`;
    const description = field.description || `Question ${index + 1}`;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <input
              type="text"
              disabled
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '4px', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#737373',
                boxSizing: 'border-box',
              }}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <textarea
              disabled
              rows={4}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '4px', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#737373',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
            />
          </div>
        );

      case 'radio':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '12px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {field.options?.map((option, optIndex) => (
                <div key={optIndex}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'default',
                    color: '#737373',
                    fontSize: '14px',
                  }}>
                    <input
                      type="radio"
                      disabled
                      style={{ marginRight: '10px', cursor: 'default' }}
                    />
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '12px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {field.options?.map((option, optIndex) => (
                <div key={optIndex}>
                  <label style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    cursor: 'default',
                    color: '#737373',
                    fontSize: '14px',
                  }}>
                    <input
                      type="checkbox"
                      disabled
                      style={{ marginRight: '10px', cursor: 'default' }}
                    />
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <input
              type="file"
              disabled
              accept={field.accept}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '4px', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#737373',
                boxSizing: 'border-box',
              }}
            />
          </div>
        );

      case 'email':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <input
              type="email"
              disabled
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '4px', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#737373',
                boxSizing: 'border-box',
              }}
              placeholder="Please enter your email"
            />
          </div>
        );

      case 'gpa':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <input
              type="text"
              disabled
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '4px', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#737373',
                boxSizing: 'border-box',
              }}
              placeholder="Please enter your GPA"
            />
          </div>
        );

      case 'graduation_year':
        return (
          <div key={field.id || index} style={{ marginBottom: '24px' }}>
            {description && (
              <div style={{ marginBottom: '8px', color: '#737373', fontSize: '14px', fontWeight: '500' }}>
                {description}
              </div>
            )}
            <label style={{ 
              display: 'block',
              color: '#0a0a0a',
              fontSize: '16px',
              fontWeight: '500',
              marginBottom: '8px',
            }}>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: '#dc3545', marginLeft: '4px' }}> *</span>}
            </label>
            <input
              type="number"
              disabled
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                marginTop: '4px', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #e5e5e5',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#737373',
                boxSizing: 'border-box',
              }}
              placeholder="Please enter your graduation year"
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (previewMode) {
    return (
      <div style={{ 
        padding: '20px', 
        paddingTop: '90px',
        backgroundColor: '#F5FCEE',
        minHeight: '100vh',
        position: 'relative',
      }}>
        {showSaveNotification && (
          <div style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#4D7298',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            zIndex: 1000,
            fontSize: '15px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'slideDown 0.3s ease-out',
          }}>
            <span style={{ fontSize: '18px' }}>✓</span>
            Form saved
          </div>
        )}
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '30px',
            flexWrap: 'wrap',
            gap: '15px',
          }}>
            <h1 style={{ 
              color: '#2d3436', 
              fontSize: '32px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              {form.name}
            </h1>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                onClick={handleViewResponses}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#77A6B6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4D7298';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#77A6B6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Responses
              </button>
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={!publicLink}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4D7298',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: publicLink ? 'pointer' : 'not-allowed',
                  opacity: publicLink ? 1 : 0.6,
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (publicLink) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = publicLink ? 1 : 0.6;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Publish
              </button>
              <button 
                onClick={() => setPreviewMode(false)} 
                style={{ 
                  padding: '10px 20px',
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
                Exit Preview
              </button>
            </div>
          </div>
          <div style={{ 
            border: '1px solid #f5f5f4', 
            padding: '32px', 
            borderRadius: '16px', 
            backgroundColor: 'white',
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
            {fields.length === 0 ? (
              <p style={{ color: '#737373', textAlign: 'center', padding: '40px' }}>
                No fields yet. Add fields to see preview.
              </p>
            ) : (
              fields.map((field, index) => renderPreviewField(field, index))
            )}
            <button 
              disabled 
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#e5e5e5',
                color: '#a3a3a3',
                border: 'none',
                borderRadius: '8px',
                cursor: 'not-allowed',
                marginTop: '30px',
                width: '100%',
                fontWeight: '500',
              }}
            >
              Submit Application (Preview)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {showSaveNotification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#4D7298',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '10px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          zIndex: 1000,
          fontSize: '15px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'slideDown 0.3s ease-out',
        }}>
          <span style={{ fontSize: '18px' }}>✓</span>
          Form saved
        </div>
      )}
      <div style={{ 
        backgroundColor: '#F5FCEE',
        minHeight: '100vh',
        padding: '20px',
        paddingTop: '90px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start', 
            marginBottom: '30px', 
            gap: '20px', 
            flexWrap: 'wrap' 
          }}>
            <div style={{ flex: 1 }}>
              <button 
                onClick={() => navigate('/admin')} 
                style={{ 
                  marginBottom: '12px',
                  padding: '8px 16px', 
                  backgroundColor: 'white', 
                  color: '#737373', 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
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
                ← Back to Timeline
              </button>
              <h1 style={{ 
                margin: 0,
                color: '#2d3436',
                fontSize: '32px',
                fontWeight: '600',
                letterSpacing: '-0.02em',
              }}>
                {form.name}
              </h1>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setPreviewMode(true)} 
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#9DC3C2', 
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
                  e.currentTarget.style.backgroundColor = '#9DC3C2';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Preview
              </button>
              <button
                onClick={handleViewResponses}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#77A6B6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#4D7298';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#77A6B6';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                View Responses
              </button>
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={!publicLink}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4D7298',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: publicLink ? 'pointer' : 'not-allowed',
                  opacity: publicLink ? 1 : 0.6,
                  fontWeight: '500',
                  fontSize: '14px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  if (publicLink) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = publicLink ? 1 : 0.6;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Publish
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ 
                marginBottom: '24px',
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                border: '1px solid #f5f5f4',
              }}>
                <h3 style={{ 
                  color: '#0a0a0a',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}>
                  Add Field
                </h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {[
                    { type: 'text', label: 'Short Text' },
                    { type: 'textarea', label: 'Long Text' },
                    { type: 'radio', label: 'Multiple Choice' },
                    { type: 'checkbox', label: 'Checkboxes' },
                    { type: 'file', label: 'File Upload' },
                    { type: 'email', label: 'Email' },
                    { type: 'gpa', label: 'GPA' },
                    { type: 'graduation_year', label: 'Graduation Year' },
                  ].map(({ type, label }) => (
                    <button 
                      key={type}
                      onClick={() => addField(type)}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: '#9DC3C2',
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
                        e.currentTarget.style.backgroundColor = '#9DC3C2';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                border: '1px solid #f5f5f4',
              }}>
                <h3 style={{ 
                  color: '#0a0a0a',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  letterSpacing: '-0.01em',
                }}>
                  Fields ({fields.length})
                </h3>
                {fields.length === 0 ? (
                  <p style={{ color: '#737373', textAlign: 'center', padding: '40px' }}>
                    No fields yet. Add a field to get started.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {fields.map((field, index) => (
                      <div 
                        key={field.id}
                        style={{
                          border: selectedField === field.id ? '2px solid #4D7298' : '1px solid #f5f5f4',
                          padding: '16px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          backgroundColor: selectedField === field.id ? '#F5FCEE' : 'white',
                          transition: 'all 0.2s ease',
                        }}
                        onClick={() => setSelectedField(field.id)}
                        onMouseEnter={(e) => {
                          if (selectedField !== field.id) {
                            e.currentTarget.style.borderColor = '#9DC3C2';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(157,195,194,0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedField !== field.id) {
                            e.currentTarget.style.borderColor = '#f5f5f4';
                            e.currentTarget.style.boxShadow = 'none';
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <strong style={{ color: '#0a0a0a', fontSize: '16px' }}>
                                {field.label || `Field ${index + 1}`}
                              </strong>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#737373',
                                backgroundColor: '#f5f5f4',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}>
                                {field.type}
                              </span>
                              {field.required && (
                                <span style={{ 
                                  fontSize: '12px', 
                                  color: '#84BF5F',
                                  fontWeight: '500',
                                }}>
                                  • Required
                                </span>
                              )}
                            </div>
                            {field.description && (
                              <div style={{ fontSize: '13px', color: '#a3a3a3', marginTop: '4px' }}>
                                {field.description}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }}
                              disabled={index === 0}
                              style={{ 
                                padding: '6px 10px',
                                backgroundColor: index === 0 ? '#f5f5f5' : 'white',
                                color: index === 0 ? '#a3a3a3' : '#4D7298',
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                cursor: index === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (index !== 0) {
                                  e.currentTarget.style.backgroundColor = '#9DC3C2';
                                  e.currentTarget.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (index !== 0) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                  e.currentTarget.style.color = '#4D7298';
                                }
                              }}
                            >
                              ↑
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }}
                              disabled={index === fields.length - 1}
                              style={{ 
                                padding: '6px 10px',
                                backgroundColor: index === fields.length - 1 ? '#f5f5f5' : 'white',
                                color: index === fields.length - 1 ? '#a3a3a3' : '#4D7298',
                                border: '1px solid #e5e5e5',
                                borderRadius: '6px',
                                cursor: index === fields.length - 1 ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (index !== fields.length - 1) {
                                  e.currentTarget.style.backgroundColor = '#9DC3C2';
                                  e.currentTarget.style.color = 'white';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (index !== fields.length - 1) {
                                  e.currentTarget.style.backgroundColor = 'white';
                                  e.currentTarget.style.color = '#4D7298';
                                }
                              }}
                            >
                              ↓
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                              style={{ 
                                padding: '6px 10px',
                                color: '#dc3545',
                                background: 'white',
                                border: '1px solid #f5f5f4',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#fee';
                                e.currentTarget.style.borderColor = '#dc3545';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#f5f5f4';
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleSave} 
                  disabled={saving} 
                  style={{ 
                    padding: '12px 24px', 
                    fontSize: '16px',
                    backgroundColor: saving ? '#9DC3C2' : '#4D7298',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: '500',
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
                  {saving ? 'Saving...' : 'Save Form'}
                </button>
              </div>
            </div>

            {selectedFieldData && (
              <div style={{ 
                flex: '0 0 400px',
                backgroundColor: 'white',
                border: '1px solid #f5f5f4',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                position: 'sticky',
                top: '100px',
                maxHeight: 'calc(100vh - 120px)',
                overflowY: 'auto',
              }}>
                <h3 style={{ 
                  color: '#0a0a0a',
                  fontSize: '20px',
                  fontWeight: '600',
                  marginBottom: '20px',
                  letterSpacing: '-0.01em',
                }}>
                  Edit Field
                </h3>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    color: '#0a0a0a',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                  }}>
                    Label
                  </label>
                  <input
                    type="text"
                    value={selectedFieldData.label}
                    onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px', 
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    placeholder="Enter field label"
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

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    color: '#0a0a0a',
                    fontSize: '14px',
                    fontWeight: '500',
                  }}>
                    <input
                      type="checkbox"
                      checked={selectedFieldData.required}
                      onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                    Required
                  </label>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block',
                    color: '#0a0a0a',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px',
                  }}>
                    Description
                  </label>
                  <input
                    type="text"
                    value={selectedFieldData.description || ''}
                    onChange={(e) => updateField(selectedFieldData.id, { description: e.target.value })}
                    style={{ 
                      width: '100%', 
                      padding: '10px 12px',
                      border: '1px solid #e5e5e5',
                      borderRadius: '8px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box',
                    }}
                    placeholder="e.g., Question 1"
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#9DC3C2';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(157,195,194,0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#e5e5e5';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <small style={{ display: 'block', color: '#a3a3a3', marginTop: '6px', fontSize: '12px' }}>
                    appears above the question
                  </small>
                </div>

                {(selectedFieldData.type === 'radio' || selectedFieldData.type === 'checkbox') && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block',
                      color: '#0a0a0a',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '12px',
                    }}>
                      Options
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {selectedFieldData.options?.map((option, optIndex) => (
                        <div key={optIndex} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...selectedFieldData.options];
                              newOptions[optIndex] = e.target.value;
                              updateField(selectedFieldData.id, { options: newOptions });
                            }}
                            style={{ 
                              flex: 1, 
                              padding: '10px 12px',
                              border: '1px solid #e5e5e5',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              transition: 'all 0.2s ease',
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
                          <button
                            onClick={() => {
                              if (selectedFieldData.options.length <= 1) {
                                alert('You must have at least one option');
                                return;
                              }
                              const newOptions = selectedFieldData.options.filter((_, i) => i !== optIndex);
                              updateField(selectedFieldData.id, { options: newOptions });
                            }}
                            disabled={selectedFieldData.options.length <= 1}
                            style={{ 
                              padding: '8px 12px',
                              color: selectedFieldData.options.length <= 1 ? '#a3a3a3' : '#dc3545',
                              background: 'white',
                              border: '1px solid #f5f5f4',
                              borderRadius: '8px',
                              cursor: selectedFieldData.options.length <= 1 ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: '500',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (selectedFieldData.options.length > 1) {
                                e.currentTarget.style.backgroundColor = '#fee';
                                e.currentTarget.style.borderColor = '#dc3545';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.borderColor = '#f5f5f4';
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        const newOptions = [...(selectedFieldData.options || []), 'New Option'];
                        updateField(selectedFieldData.id, { options: newOptions });
                      }}
                      style={{ 
                        marginTop: '12px', 
                        padding: '8px 16px',
                        backgroundColor: '#9DC3C2',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'all 0.2s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#77A6B6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#9DC3C2';
                      }}
                    >
                      Add Option
                    </button>
                  </div>
                )}

                {selectedFieldData.type === 'file' && (
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block',
                      color: '#0a0a0a',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '8px',
                    }}>
                      Accepted file types
                    </label>
                    <input
                      type="text"
                      value={selectedFieldData.accept || ''}
                      onChange={(e) => updateField(selectedFieldData.id, { accept: e.target.value })}
                      style={{ 
                        width: '100%', 
                        padding: '10px 12px',
                        border: '1px solid #e5e5e5',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        transition: 'all 0.2s ease',
                        boxSizing: 'border-box',
                      }}
                      placeholder=".pdf,.doc,.docx"
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
                )}
              </div>
            )}

            {!selectedFieldData && fields.length > 0 && (
              <div style={{ 
                flex: '0 0 400px',
                backgroundColor: 'white',
                border: '1px solid #f5f5f4',
                padding: '24px',
                borderRadius: '16px',
                boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                color: '#737373',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '200px',
              }}>
                <p style={{ margin: 0, fontSize: '16px' }}>Select a field to edit its properties</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPublishModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
          }}
          onClick={closePublishModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: 'white',
              padding: '32px',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
              border: '1px solid #f5f5f4',
            }}
          >
            <h2 style={{ 
              marginTop: 0,
              marginBottom: '20px',
              color: '#2d3436',
              fontSize: '24px',
              fontWeight: '600',
              letterSpacing: '-0.01em',
            }}>
              Publish Form
            </h2>
            {publicLink ? (
              <div>
                <p style={{ 
                  marginBottom: '16px',
                  color: '#737373',
                  fontSize: '14px',
                }}>
                  Share this link with applicants to let them apply directly.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  backgroundColor: '#F5FCEE',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #f5f5f4',
                  marginBottom: '16px'
                }}>
                  <span style={{ 
                    wordBreak: 'break-all', 
                    fontFamily: 'monospace', 
                    fontSize: '13px', 
                    flex: 1,
                    color: '#0a0a0a',
                  }}>
                    {publicLink}
                  </span>
                  <button
                    onClick={handleCopyPublicLink}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: copyStatus === 'copied' ? '#84BF5F' : '#4D7298',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={(e) => {
                      if (copyStatus !== 'copied') {
                        e.currentTarget.style.backgroundColor = '#77A6B6';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (copyStatus !== 'copied') {
                        e.currentTarget.style.backgroundColor = '#4D7298';
                      }
                    }}
                  >
                    {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {copyStatus === 'error' && (
                  <p style={{ 
                    color: '#dc3545', 
                    marginTop: '-8px', 
                    marginBottom: '16px',
                    fontSize: '13px',
                  }}>
                    Unable to copy automatically. Please copy the link manually.
                  </p>
                )}
              </div>
            ) : (
              <p style={{ 
                marginBottom: '20px',
                color: '#737373',
                fontSize: '14px',
              }}>
                Save the form first to generate a public link.
              </p>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {publicLink && (
                <a
                  href={publicLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#4D7298',
                    color: 'white',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s ease',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Open Link
                </a>
              )}
              <button
                onClick={closePublishModal}
                style={{ 
                  padding: '10px 20px', 
                  border: '1px solid #e5e5e5', 
                  borderRadius: '8px', 
                  backgroundColor: 'white', 
                  cursor: 'pointer',
                  color: '#737373',
                  fontSize: '14px',
                  fontWeight: '500',
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default EditForm;
