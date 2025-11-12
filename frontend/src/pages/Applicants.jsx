import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Applicants() {
  const [forms, setForms] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const formsResponse = await fetch('/api/forms');
      const formsData = await formsResponse.json();
      setForms(formsData);

      // Fetch responses for all forms
      const responsesPromises = formsData.map(form =>
        fetch(`/api/forms/${form.id}/responses`)
          .then(res => res.json())
          .then(responses => responses.map(r => ({ ...r, form_id: form.id, form_name: form.name })))
          .catch(() => [])
      );

      const allResponsesData = await Promise.all(responsesPromises);
      const flattened = allResponsesData.flat();
      setAllResponses(flattened);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px', paddingBottom: '70px' }}>Loading applicants...</div>;

  return (
    <div style={{ padding: '20px', paddingBottom: '70px' }}>
      <h1>Applicants</h1>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        View all responses across all forms ({allResponses.length} total)
      </p>

      {allResponses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <p>No applicants yet.</p>
          <p>Create a form and share it to start receiving applications.</p>
        </div>
      ) : (
        <div>
          {forms.map(form => {
            const formResponses = allResponses.filter(r => r.form_id === form.id);
            if (formResponses.length === 0) return null;

            return (
              <div key={form.id} style={{ marginBottom: '30px' }}>
                <h2 style={{ marginBottom: '10px' }}>
                  {form.name} ({formResponses.length} {formResponses.length === 1 ? 'response' : 'responses'})
                </h2>
                <Link 
                  to={`/admin/forms/${form.id}/responses`}
                  style={{ 
                    color: '#007bff', 
                    textDecoration: 'none',
                    fontSize: '14px',
                    marginBottom: '15px',
                    display: 'inline-block'
                  }}
                >
                  View all responses →
                </Link>
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {formResponses.slice(0, 3).map(response => {
                    const data = typeof response.response_data === 'string' 
                      ? JSON.parse(response.response_data) 
                      : response.response_data;
                    
                    return (
                      <li 
                        key={response.id} 
                        style={{ 
                          border: '1px solid #ccc', 
                          padding: '15px', 
                          marginBottom: '10px', 
                          borderRadius: '5px',
                          backgroundColor: '#f9f9f9'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                          <div>
                            {response.applicant_name && (
                              <p style={{ margin: 0, fontWeight: 'bold' }}>{response.applicant_name}</p>
                            )}
                            {response.applicant_email && (
                              <p style={{ margin: '4px 0 0 0', color: '#666', fontSize: '14px' }}>{response.applicant_email}</p>
                            )}
                          </div>
                          <span style={{ fontSize: '12px', color: '#999' }}>
                            {new Date(response.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                        <Link 
                          to={`/admin/forms/${form.id}/responses`}
                          style={{ 
                            color: '#007bff', 
                            textDecoration: 'none',
                            fontSize: '12px'
                          }}
                        >
                          View details →
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {formResponses.length > 3 && (
                  <Link 
                    to={`/admin/forms/${form.id}/responses`}
                    style={{ 
                      color: '#007bff', 
                      textDecoration: 'none',
                      fontSize: '14px'
                    }}
                  >
                    View {formResponses.length - 3} more {formResponses.length - 3 === 1 ? 'response' : 'responses'} →
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Applicants;

