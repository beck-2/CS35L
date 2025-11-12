import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function AdminDashboard() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Form Dashboard</h1>
      <Link to="/admin/forms/new">
        <button>Create New Form</button>
      </Link>
      
      <h2>Your Forms</h2>
      {forms.length === 0 ? (
        <p>No forms yet. Create your first form!</p>
      ) : (
        <ul>
          {forms.map(form => (
            <li key={form.id}>
              <h3>{form.name}</h3>
              <p>Created: {new Date(form.created_at).toLocaleDateString()}</p>
              <Link to={`/admin/forms/${form.id}/edit`}>Edit</Link>
              {' | '}
              <Link to={`/admin/forms/${form.id}/responses`}>View Responses</Link>
              {' | '}
              <a href={`/apply/${form.public_id}`} target="_blank" rel="noopener noreferrer">
                Public Link
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminDashboard;

