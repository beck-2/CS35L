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
      ...(type === 'file' ? { accept: '.pdf,.doc,.docx' } : {})
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
      alert('Form saved successfully!');
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

  if (loading) return <div>Loading...</div>;
  if (!form) return <div>Form not found</div>;

  const selectedFieldData = fields.find(f => f.id === selectedField);

  const renderPreviewField = (field, index) => {
    const fieldName = field.id || `field_${index}`;
    const description = field.description || `Question ${index + 1}`;

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
              type="text"
              disabled
              style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#f5f5f5' }}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <textarea
              disabled
              rows={4}
              style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#f5f5f5' }}
            />
          </div>
        );

      case 'radio':
        return (
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <div style={{ marginTop: '5px' }}>
              {field.options?.map((option, optIndex) => (
                <div key={optIndex} style={{ marginBottom: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      disabled
                      style={{ marginRight: '8px' }}
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
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <div style={{ marginTop: '5px' }}>
              {field.options?.map((option, optIndex) => (
                <div key={optIndex} style={{ marginBottom: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      disabled
                      style={{ marginRight: '8px' }}
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
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label || 'Untitled Field'}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
              type="file"
              disabled
              accept={field.accept}
              style={{ width: '100%', padding: '8px', marginTop: '5px', backgroundColor: '#f5f5f5' }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (previewMode) {
    return (
      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', paddingBottom: '70px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1>{form.name}</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <button
              onClick={handleViewResponses}
              style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              View Responses
            </button>
            <button
              onClick={() => setShowPublishModal(true)}
              disabled={!publicLink}
              style={{
                padding: '8px 16px',
                backgroundColor: '#ffc107',
                color: '#212529',
                border: 'none',
                borderRadius: '5px',
                cursor: publicLink ? 'pointer' : 'not-allowed',
                opacity: publicLink ? 1 : 0.6
              }}
            >
              Publish
            </button>
            <button onClick={() => setPreviewMode(false)} style={{ padding: '8px 16px' }}>
              Exit Preview
            </button>
          </div>
        </div>
        <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '5px', backgroundColor: 'white' }}>
          {fields.length === 0 ? (
            <p>No fields yet. Add fields to see preview.</p>
          ) : (
            fields.map((field, index) => renderPreviewField(field, index))
          )}
          <button 
            disabled 
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'not-allowed',
              marginTop: '20px'
            }}
          >
            Submit Application (Preview)
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '20px', padding: '20px', paddingBottom: '70px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '20px', flexWrap: 'wrap' }}>
            <div>
              <button 
                onClick={() => navigate('/admin')} 
                style={{ 
                  marginBottom: '10px',
                  padding: '8px 16px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '5px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                ← Back to Timeline
              </button>
              <h1 style={{ margin: 0 }}>Edit Form: {form.name}</h1>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setPreviewMode(true)} 
                style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                Preview
              </button>
              <button
                onClick={handleViewResponses}
                style={{ padding: '8px 16px', backgroundColor: '#17a2b8', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                View Responses
              </button>
              <button
                onClick={() => setShowPublishModal(true)}
                disabled={!publicLink}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: publicLink ? 'pointer' : 'not-allowed',
                  opacity: publicLink ? 1 : 0.6
                }}
              >
                Publish
              </button>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Add Field</h3>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button onClick={() => addField('text')}>Short Text</button>
              <button onClick={() => addField('textarea')}>Long Text</button>
              <button onClick={() => addField('radio')}>Multiple Choice</button>
              <button onClick={() => addField('checkbox')}>Checkboxes</button>
              <button onClick={() => addField('file')}>File Upload</button>
            </div>
          </div>

          <div>
            <h3>Fields ({fields.length})</h3>
            {fields.length === 0 ? (
              <p>No fields yet. Add a field to get started.</p>
            ) : (
              <div>
                {fields.map((field, index) => (
                  <div 
                    key={field.id}
                    style={{
                      border: selectedField === field.id ? '2px solid blue' : '1px solid #ccc',
                      padding: '10px',
                      marginBottom: '10px',
                      cursor: 'pointer',
                      backgroundColor: selectedField === field.id ? '#f0f8ff' : 'white'
                    }}
                    onClick={() => setSelectedField(field.id)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div>
                          <strong>{field.label || `Field ${index + 1}`}</strong>
                          <span style={{ marginLeft: '10px', color: '#666' }}>
                            ({field.type}) {field.required && '• Required'}
                          </span>
                        </div>
                        {field.description && (
                          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                            {field.description}
                          </div>
                        )}
                      </div>
                      <div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveField(field.id, 'up'); }}
                          disabled={index === 0}
                          style={{ marginRight: '5px' }}
                        >
                          ↑
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); moveField(field.id, 'down'); }}
                          disabled={index === fields.length - 1}
                          style={{ marginRight: '5px' }}
                        >
                          ↓
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                          style={{ color: 'red' }}
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

          <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleSave} 
              disabled={saving} 
              style={{ 
                padding: '10px 20px', 
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1
              }}
            >
              {saving ? 'Saving...' : 'Save Form'}
            </button>
            <button 
              onClick={() => navigate('/admin')} 
              style={{ 
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              ← Back to Timeline
            </button>
          </div>
        </div>

        {selectedFieldData && (
          <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '5px' }}>
            <h3>Edit Field</h3>
            <div style={{ marginBottom: '15px' }}>
              <label>
                Label:
                <input
                  type="text"
                  value={selectedFieldData.label}
                  onChange={(e) => updateField(selectedFieldData.id, { label: e.target.value })}
                  style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                  placeholder="Enter field label"
                />
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={selectedFieldData.required}
                  onChange={(e) => updateField(selectedFieldData.id, { required: e.target.checked })}
                />
                Required
              </label>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>
                Description:
                <input
                  type="text"
                  value={selectedFieldData.description || ''}
                  onChange={(e) => updateField(selectedFieldData.id, { description: e.target.value })}
                  style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                  placeholder="e.g., Question 1"
                />
                <small style={{ display: 'block', color: '#666', marginTop: '3px' }}>
                  appears above the question
                </small>
              </label>
            </div>

            {(selectedFieldData.type === 'radio' || selectedFieldData.type === 'checkbox') && (
              <div style={{ marginBottom: '15px' }}>
                <label>Options:</label>
                {selectedFieldData.options?.map((option, optIndex) => (
                  <div key={optIndex} style={{ display: 'flex', marginTop: '5px' }}>
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...selectedFieldData.options];
                        newOptions[optIndex] = e.target.value;
                        updateField(selectedFieldData.id, { options: newOptions });
                      }}
                      style={{ flex: 1, padding: '5px' }}
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
                        marginLeft: '5px', 
                        color: selectedFieldData.options.length <= 1 ? '#ccc' : 'red',
                        cursor: selectedFieldData.options.length <= 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    const newOptions = [...(selectedFieldData.options || []), 'New Option'];
                    updateField(selectedFieldData.id, { options: newOptions });
                  }}
                  style={{ marginTop: '10px', padding: '5px 10px' }}
                >
                  Add Option
                </button>
              </div>
            )}

            {selectedFieldData.type === 'file' && (
              <div style={{ marginBottom: '15px' }}>
                <label>
                  Accepted file types:
                  <input
                    type="text"
                    value={selectedFieldData.accept || ''}
                    onChange={(e) => updateField(selectedFieldData.id, { accept: e.target.value })}
                    style={{ width: '100%', padding: '5px', marginTop: '5px' }}
                    placeholder=".pdf,.doc,.docx"
                  />
                </label>
              </div>
            )}
          </div>
        )}

        {!selectedFieldData && fields.length > 0 && (
          <div style={{ flex: 1, border: '1px solid #ccc', padding: '20px', borderRadius: '5px', color: '#666' }}>
            <p>Select a field to edit its properties</p>
          </div>
        )}
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
              padding: '30px',
              borderRadius: '8px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
            }}
          >
            <h2 style={{ marginTop: 0 }}>Publish Form</h2>
            {publicLink ? (
              <div>
                <p style={{ marginBottom: '10px' }}>
                  Share this link with applicants to let them apply directly.
                </p>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  backgroundColor: '#f8f9fa',
                  padding: '12px 15px',
                  borderRadius: '6px',
                  border: '1px solid #e2e6ea',
                  marginBottom: '15px'
                }}>
                  <span style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '14px', flex: 1 }}>
                    {publicLink}
                  </span>
                  <button
                    onClick={handleCopyPublicLink}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {copyStatus === 'copied' ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                {copyStatus === 'error' && (
                  <p style={{ color: 'red', marginTop: '-5px', marginBottom: '15px' }}>
                    Unable to copy automatically. Please copy the link manually.
                  </p>
                )}
              </div>
            ) : (
              <p style={{ marginBottom: '20px' }}>
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
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    borderRadius: '5px',
                    textDecoration: 'none'
                  }}
                >
                  Open Link
                </a>
              )}
              <button
                onClick={closePublishModal}
                style={{ padding: '8px 16px', border: '1px solid #ced4da', borderRadius: '5px', backgroundColor: 'white', cursor: 'pointer' }}
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
