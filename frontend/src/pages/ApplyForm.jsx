import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ApplyForm() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileData, setFileData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetch(`/api/forms/public/${formId}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching form:', err);
        setLoading(false);
      });
  }, [formId]);

  const handleFileChange = async (fieldId, file) => {
    if (!file) return;

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setFileData(prev => ({ ...prev, [fieldId]: base64 }));
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validateField = (field, value) => {
    const fieldName = field.id;
    
    if (field.type === 'email') {
      const emailRegex = new RegExp(field.validation || '^(?:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})$');
      if (!emailRegex.test(value)) {
        setValidationErrors(prev => ({ ...prev, [fieldName]: 'Error: Please enter a valid email' }));
        return false;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      }
    }
    
    if (field.type === 'gpa') {
      const gpaRegex = new RegExp(field.validation || '^(?:[0-3]\\.\\d+|4\\.00)$');
      if (!gpaRegex.test(value)) {
        setValidationErrors(prev => ({ ...prev, [fieldName]: 'Error: Please enter a valid GPA' }));
        return false;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      }
    }
    
    if (field.type === 'graduation_year') {
      const currentYear = new Date().getFullYear();
      const minYear = currentYear;
      const maxYear = currentYear + 4;
      const yearValue = parseInt(value, 10);
      
      if (isNaN(yearValue) || yearValue < minYear || yearValue > maxYear) {
        setValidationErrors(prev => ({ ...prev, [fieldName]: `Error: Please enter a valid graduation year (${minYear}-${maxYear})` }));
        return false;
      } else {
        setValidationErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
        return true;
      }
    }
    
    return true;
  };

  const handleFieldBlur = (field, e) => {
    const value = e.target.value;
    if (value) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const responseData = {};
    let hasValidationErrors = false;

    const fields = form.definition?.fields || [];
    for (const field of fields) {
      const fieldName = field.id || `field_${fields.indexOf(field)}`;
      const value = formData.get(fieldName);
      
      if (value && (field.type === 'email' || field.type === 'gpa' || field.type === 'graduation_year')) {
        const isValid = validateField(field, value);
        if (!isValid) {
          hasValidationErrors = true;
        }
      }
    }

    if (hasValidationErrors) {
      return;
    }

    setSubmitting(true);

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_')) {
        const fieldId = key.replace('file_', '');
        const file = e.target.querySelector(`[name="${key}"]`).files[0];
        if (file) {
          try {
            const base64 = await handleFileChange(fieldId, file);
            responseData[fieldId] = base64;
          } catch (error) {
            console.error('Error processing file:', error);
            alert('Error processing file. Please try again.');
            setSubmitting(false);
            return;
          }
        }
      } else if (key.startsWith('checkbox_')) {
        const fieldId = key.replace('checkbox_', '');
        if (!responseData[fieldId]) {
          responseData[fieldId] = [];
        }
        if (value) {
          responseData[fieldId].push(value);
        }
      } else {
        responseData[key] = value;
      }
    }

    const applicantName = responseData.name || responseData['field_0'] || '';
    const applicantEmail = responseData.email || responseData['field_1'] || '';

    try {
      const response = await fetch(`/api/forms/public/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_data: responseData,
          applicant_name: applicantName,
          applicant_email: applicantEmail
        })
      });

      if (!response.ok) {
        throw new Error('Submission failed');
      }

      navigate(`/apply/${formId}/success`);
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '40px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: '18px', color: '#4D7298' }}>Loading form...</div>
    </div>
  );
  
  if (!form) return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '40px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ fontSize: '18px', color: '#737373' }}>Form not found</div>
    </div>
  );

  const fields = form.definition?.fields || [];

  const renderField = (field, index) => {
    const fieldName = field.id || `field_${index}`;
    const description = field.description || `Question ${index + 1}`;

    const fieldContainerStyle = {
      marginBottom: '32px',
      paddingBottom: '32px',
      borderBottom: index < fields.length - 1 ? '1px solid #f0f0f0' : 'none',
    };

    const labelStyle = {
      display: 'block',
      fontWeight: '600',
      color: '#2d3436',
      fontSize: '16px',
      marginBottom: '8px',
    };

    const descriptionStyle = {
      color: '#737373',
      fontSize: '14px',
      marginBottom: '12px',
      fontStyle: 'italic',
    };

    const inputStyle = {
      width: '100%',
      padding: '12px 16px',
      fontSize: '15px',
      border: '2px solid #e5e5e5',
      borderRadius: '8px',
      outline: 'none',
      transition: 'border-color 0.2s ease',
      fontFamily: 'inherit',
      backgroundColor: '#fafafa',
    };

    const inputFocusStyle = {
      borderColor: '#9DC3C2',
      backgroundColor: 'white',
    };

    switch (field.type) {
      case 'text':
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type="text"
              name={fieldName}
              required={field.required}
              style={inputStyle}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.backgroundColor = '#fafafa'; }}
            />
          </div>
        );

      case 'textarea':
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <textarea
              name={fieldName}
              required={field.required}
              rows={4}
              style={{...inputStyle, resize: 'vertical', minHeight: '100px'}}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.backgroundColor = '#fafafa'; }}
            />
          </div>
        );

      case 'radio':
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {field.options?.map((option, optIndex) => (
                <label 
                  key={optIndex} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#F5FCEE',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#9DC3C2';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.querySelector('input').checked) {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.backgroundColor = '#F5FCEE';
                    }
                  }}
                >
                  <input
                    type="radio"
                    name={fieldName}
                    value={option}
                    required={field.required}
                    style={{ 
                      marginRight: '12px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#4D7298',
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        e.target.parentElement.style.borderColor = '#4D7298';
                        e.target.parentElement.style.backgroundColor = '#ffffff';
                      }
                    }}
                  />
                  <span style={{ fontSize: '15px', color: '#2d3436' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {field.options?.map((option, optIndex) => (
                <label 
                  key={optIndex} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '12px 16px',
                    backgroundColor: '#F5FCEE',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#9DC3C2';
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                  onMouseLeave={(e) => {
                    if (!e.currentTarget.querySelector('input').checked) {
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.backgroundColor = '#F5FCEE';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    name={`checkbox_${fieldName}`}
                    value={option}
                    style={{ 
                      marginRight: '12px',
                      width: '18px',
                      height: '18px',
                      cursor: 'pointer',
                      accentColor: '#4D7298',
                    }}
                    onChange={(e) => {
                      if (e.target.checked) {
                        e.target.parentElement.style.borderColor = '#4D7298';
                        e.target.parentElement.style.backgroundColor = '#ffffff';
                      } else {
                        e.target.parentElement.style.borderColor = 'transparent';
                        e.target.parentElement.style.backgroundColor = '#F5FCEE';
                      }
                    }}
                  />
                  <span style={{ fontSize: '15px', color: '#2d3436' }}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'file':
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type="file"
              name={`file_${fieldName}`}
              required={field.required}
              accept={field.accept}
              style={{
                ...inputStyle,
                padding: '12px',
                cursor: 'pointer',
              }}
              onFocus={(e) => Object.assign(e.target.style, inputFocusStyle)}
              onBlur={(e) => { e.target.style.borderColor = '#e5e5e5'; e.target.style.backgroundColor = '#fafafa'; }}
            />
            {fileData[fieldName] && (
              <p style={{ 
                color: '#22c55e', 
                fontSize: '14px', 
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontWeight: '500',
              }}>
                ✓ File selected
              </p>
            )}
          </div>
        );

      case 'email':
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type="email"
              name={fieldName}
              required={field.required}
              style={{
                ...inputStyle,
                borderColor: validationErrors[fieldName] ? '#ef4444' : '#e5e5e5',
              }}
              onFocus={(e) => {
                if (!validationErrors[fieldName]) {
                  Object.assign(e.target.style, inputFocusStyle);
                }
              }}
              onBlur={(e) => { 
                handleFieldBlur(field, e);
                if (!validationErrors[fieldName]) {
                  e.target.style.borderColor = '#e5e5e5'; 
                  e.target.style.backgroundColor = '#fafafa';
                }
              }}
              placeholder="example@email.com"
            />
            {validationErrors[fieldName] && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                {validationErrors[fieldName]}
              </p>
            )}
          </div>
        );

      case 'gpa':
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type="text"
              name={fieldName}
              required={field.required}
              style={{
                ...inputStyle,
                borderColor: validationErrors[fieldName] ? '#ef4444' : '#e5e5e5',
              }}
              onFocus={(e) => {
                if (!validationErrors[fieldName]) {
                  Object.assign(e.target.style, inputFocusStyle);
                }
              }}
              onBlur={(e) => { 
                handleFieldBlur(field, e);
                if (!validationErrors[fieldName]) {
                  e.target.style.borderColor = '#e5e5e5'; 
                  e.target.style.backgroundColor = '#fafafa';
                }
              }}
              placeholder="e.g., 3.75"
            />
            {validationErrors[fieldName] && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                {validationErrors[fieldName]}
              </p>
            )}
          </div>
        );

      case 'graduation_year':
        const currentYear = new Date().getFullYear();
        const minYear = currentYear;
        const maxYear = currentYear + 4;
        return (
          <div key={field.id || index} style={fieldContainerStyle}>
            {description && <div style={descriptionStyle}>{description}</div>}
            <label style={labelStyle}>
              {field.label}
              {field.required && <span style={{ color: '#ef4444' }}> *</span>}
            </label>
            <input
              type="number"
              name={fieldName}
              required={field.required}
              min={minYear}
              max={maxYear}
              style={{
                ...inputStyle,
                borderColor: validationErrors[fieldName] ? '#ef4444' : '#e5e5e5',
              }}
              onFocus={(e) => {
                if (!validationErrors[fieldName]) {
                  Object.assign(e.target.style, inputFocusStyle);
                }
              }}
              onBlur={(e) => { 
                handleFieldBlur(field, e);
                if (!validationErrors[fieldName]) {
                  e.target.style.borderColor = '#e5e5e5'; 
                  e.target.style.backgroundColor = '#fafafa';
                }
              }}
              placeholder={`e.g., ${currentYear + 1}`}
            />
            {validationErrors[fieldName] && (
              <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '8px', fontWeight: '500' }}>
                {validationErrors[fieldName]}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '40px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '16px',
          marginBottom: '32px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e5e5',
        }}>
          <h1 style={{
            color: '#2d3436',
            marginBottom: '8px',
            fontSize: '32px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
          }}>
            {form.name}
          </h1>
          <p style={{ color: '#737373', fontSize: '16px', margin: 0 }}>
            Please fill out all required fields marked with <span style={{ color: '#ef4444' }}>*</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {fields.length === 0 ? (
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '16px',
              textAlign: 'center',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <p style={{ color: '#737373', fontSize: '16px' }}>This form has no fields yet.</p>
            </div>
          ) : (
            <>
              {/* Single Form Container with all fields */}
              <div style={{
                backgroundColor: 'white',
                padding: '40px',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e5e5',
                marginBottom: '24px',
              }}>
                {fields.map((field, index) => renderField(field, index))}
              </div>
              
              {/* Submit Button */}
              <div style={{
                padding: '24px',
                backgroundColor: 'white',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e5e5',
                display: 'flex',
                justifyContent: 'center',
              }}>
                <button 
                  type="submit" 
                  disabled={submitting}
                  style={{
                    padding: '14px 32px',
                    fontSize: '16px',
                    fontWeight: '600',
                    backgroundColor: submitting ? '#cccccc' : '#4D7298',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: submitting ? 'none' : '0 4px 12px rgba(77, 114, 152, 0.3)',
                    minWidth: '200px',
                  }}
                  onMouseEnter={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = '#77A6B6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(77, 114, 152, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submitting) {
                      e.currentTarget.style.backgroundColor = '#4D7298';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(77, 114, 152, 0.3)';
                    }
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default ApplyForm;
