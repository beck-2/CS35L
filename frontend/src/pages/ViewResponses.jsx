import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ViewResponses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/forms/${id}`).then(res => res.json()),
      fetch(`/api/forms/${id}/responses`).then(res => res.json())
    ])
      .then(([formData, responsesData]) => {
        setForm(formData);
        setResponses(responsesData);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div style={{ padding: '20px', paddingBottom: '70px' }}>
      <h1>Responses: {form.name}</h1>
      <Link to={`/admin/forms/${id}/edit`}>Edit Form</Link>
      {' | '}
      <button onClick={() => navigate('/admin')}>Back to Dashboard</button>
      
      <h2>Submissions ({responses.length})</h2>
      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {responses.map(response => {
            const data = typeof response.response_data === 'string' 
              ? JSON.parse(response.response_data) 
              : response.response_data;
            
            return (
              <li key={response.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
                <p><strong>Submitted:</strong> {new Date(response.submitted_at).toLocaleString()}</p>
                {response.applicant_name && <p><strong>Name:</strong> {response.applicant_name}</p>}
                {response.applicant_email && <p><strong>Email:</strong> {response.applicant_email}</p>}
                <details style={{ marginTop: '10px' }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Response Data</summary>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '3px' }}>
                    {Object.entries(data).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '10px' }}>
                        <strong>{key}:</strong>
                        {typeof value === 'string' && value.startsWith('file:') ? (
                          <div>
                            <span style={{ color: '#007bff' }}>📎 File uploaded (ID: {value.replace('file:', '')})</span>
                            <a 
                              href={`/api/files/${value.replace('file:', '')}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={{ marginLeft: '10px', color: '#007bff' }}
                            >
                              Download
                            </a>
                          </div>
                        ) : Array.isArray(value) ? (
                          <div>{value.join(', ')}</div>
                        ) : (
                          <div>{String(value)}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default ViewResponses;

