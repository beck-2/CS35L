import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/forms/${id}`)
      .then(res => res.json())
      .then(data => {
        setForm(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching form:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!form) return <div>Form not found</div>;

  return (
    <div>
      <h1>Edit Form: {form.name}</h1>
      <p>Form builder UI coming soon...</p>
      <p>Form ID: {form.id}</p>
      <p>Public ID: {form.public_id}</p>
      <button onClick={() => navigate('/admin')}>Back to Dashboard</button>
    </div>
  );
}

export default EditForm;

