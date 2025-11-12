import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function ApplyForm() {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);
    const responseData = {};
    formData.forEach((value, key) => {
      responseData[key] = value;
    });

    try {
      await fetch(`/api/forms/public/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_data: responseData,
          applicant_name: responseData.name || '',
          applicant_email: responseData.email || ''
        })
      });
      navigate(`/apply/${formId}/success`);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading form...</div>;
  if (!form) return <div>Form not found</div>;

  const fields = form.definition?.fields || [];

  return (
    <div>
      <h1>{form.name}</h1>
      <form onSubmit={handleSubmit}>
        {fields.length === 0 ? (
          <p>This form has no fields yet.</p>
        ) : (
          fields.map((field, index) => (
            <div key={index}>
              <label>
                {field.label}
                {field.required && <span>*</span>}
                <br />
                {field.type === 'textarea' ? (
                  <textarea
                    name={field.name || `field_${index}`}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                ) : (
                  <input
                    type={field.type || 'text'}
                    name={field.name || `field_${index}`}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                )}
              </label>
            </div>
          ))
        )}
        <button type="submit" disabled={submitting || fields.length === 0}>
          {submitting ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default ApplyForm;

