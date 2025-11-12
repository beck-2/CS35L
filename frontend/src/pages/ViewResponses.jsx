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
    <div>
      <h1>Responses: {form.name}</h1>
      <Link to={`/admin/forms/${id}/edit`}>Edit Form</Link>
      {' | '}
      <button onClick={() => navigate('/admin')}>Back to Dashboard</button>
      
      <h2>Submissions ({responses.length})</h2>
      {responses.length === 0 ? (
        <p>No responses yet.</p>
      ) : (
        <ul>
          {responses.map(response => (
            <li key={response.id}>
              <p><strong>Submitted:</strong> {new Date(response.submitted_at).toLocaleString()}</p>
              {response.applicant_name && <p><strong>Name:</strong> {response.applicant_name}</p>}
              {response.applicant_email && <p><strong>Email:</strong> {response.applicant_email}</p>}
              <details>
                <summary>View Response Data</summary>
                <pre>{JSON.stringify(response.response_data, null, 2)}</pre>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ViewResponses;

