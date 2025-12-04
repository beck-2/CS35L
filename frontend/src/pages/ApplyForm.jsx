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

  if (loading) return <div>Loading form...</div>;
  if (!form) return <div>Form not found</div>;

  const fields = form.definition?.fields || [];

  const renderField = (field, index) => {
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
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
              type="text"
              name={fieldName}
              required={field.required}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <textarea
              name={fieldName}
              required={field.required}
              rows={4}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
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
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <div style={{ marginTop: '5px' }}>
              {field.options?.map((option, optIndex) => (
                <div key={optIndex} style={{ marginBottom: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name={fieldName}
                      value={option}
                      required={field.required}
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
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <div style={{ marginTop: '5px' }}>
              {field.options?.map((option, optIndex) => (
                <div key={optIndex} style={{ marginBottom: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      name={`checkbox_${fieldName}`}
                      value={option}
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
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
              type="file"
              name={`file_${fieldName}`}
              required={field.required}
              accept={field.accept}
              style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            />
            {fileData[fieldName] && (
              <p style={{ color: 'green', fontSize: '14px', marginTop: '5px' }}>
                ✓ File selected
              </p>
            )}
          </div>
        );

      case 'email':
        return (
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
              type="email"
              name={fieldName}
              required={field.required}
              onBlur={(e) => handleFieldBlur(field, e)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                borderColor: validationErrors[fieldName] ? 'red' : undefined
              }}
              placeholder="Please enter your email"
            />
            {validationErrors[fieldName] && (
              <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                {validationErrors[fieldName]}
              </p>
            )}
          </div>
        );

      case 'gpa':
        return (
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
              type="text"
              name={fieldName}
              required={field.required}
              onBlur={(e) => handleFieldBlur(field, e)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                borderColor: validationErrors[fieldName] ? 'red' : undefined
              }}
              placeholder="Please enter your GPA"
            />
            {validationErrors[fieldName] && (
              <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
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
          <div key={field.id || index} style={{ marginBottom: '20px' }}>
            <div style={{ marginBottom: '5px', color: '#666', fontSize: '14px' }}>
              {description}
            </div>
            <label>
              {field.label}
              {field.required && <span style={{ color: 'red' }}> *</span>}
            </label>
            <input
              type="number"
              name={fieldName}
              required={field.required}
              min={minYear}
              max={maxYear}
              onBlur={(e) => handleFieldBlur(field, e)}
              style={{ 
                width: '100%', 
                padding: '8px', 
                marginTop: '5px',
                borderColor: validationErrors[fieldName] ? 'red' : undefined
              }}
              placeholder="Please enter your graduation year"
            />
            {validationErrors[fieldName] && (
              <p style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
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
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>{form.name}</h1>
      <form onSubmit={handleSubmit}>
        {fields.length === 0 ? (
          <p>This form has no fields yet.</p>
        ) : (
          fields.map((field, index) => renderField(field, index))
        )}
        <button 
          type="submit" 
          disabled={submitting || fields.length === 0}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: submitting ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: submitting ? 'not-allowed' : 'pointer',
            marginTop: '20px'
          }}
        >
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default ApplyForm;
