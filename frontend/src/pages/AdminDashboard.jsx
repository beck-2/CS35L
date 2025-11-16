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

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', paddingTop: '80px' }}>
      <h1>Form Dashboard</h1>
      <Link to="/admin/forms/new">
        <button>Create New Form</button>
      </Link>
      
      <h2>Your Forms</h2>
      {forms.length === 0 ? (
        <p>No forms yet. Create your first form!</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {forms.map(form => (
            <li key={form.id} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px', borderRadius: '5px' }}>
              <h3>{form.name}</h3>
              <p>Created: {new Date(form.created_at).toLocaleDateString()}</p>
              <div style={{ marginTop: '10px' }}>
                <Link to={`/admin/forms/${form.id}/edit`} style={{ marginRight: '10px' }}>Edit</Link>
                <Link to={`/admin/forms/${form.id}/responses`} style={{ marginRight: '10px' }}>View Responses</Link>
                <a href={`/apply/${form.public_id}`} target="_blank" rel="noopener noreferrer" style={{ marginRight: '10px' }}>
                  Public Link
                </a>
                <button
                  onClick={() => handleDelete(form.id, form.name)}
                  disabled={deleting === form.id}
                  style={{
                    color: 'red',
                    background: 'none',
                    border: 'none',
                    cursor: deleting === form.id ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  {deleting === form.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminDashboard;

