import { useParams } from 'react-router-dom';

function SuccessPage() {
  const { formId } = useParams();

  return (
    <div>
      <h1>Application Submitted Successfully!</h1>
      <p>Thank you for your submission. We'll review your application and get back to you soon.</p>
      <p>Form ID: {formId}</p>
    </div>
  );
}

export default SuccessPage;

