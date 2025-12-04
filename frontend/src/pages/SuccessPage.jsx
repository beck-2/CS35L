import { useParams } from 'react-router-dom';

function SuccessPage() {
  const { formId } = useParams();

  return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '40px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        <div style={{
          backgroundColor: 'white',
          padding: '48px 32px',
          borderRadius: '16px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e5e5',
          textAlign: 'center',
        }}>
          {/* Success Icon */}
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#F5FCEE',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '3px solid #9DC3C2',
          }}>
            <svg 
              width="40" 
              height="40" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#4D7298" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <h1 style={{
            color: '#2d3436',
            marginBottom: '16px',
            fontSize: '32px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
          }}>
            Application Submitted Successfully!
          </h1>
          
          <p style={{ 
            color: '#737373', 
            fontSize: '16px',
            lineHeight: '1.6',
            marginBottom: '24px',
          }}>
            Thank you for your submission. We'll review your application and get back to you soon.
          </p>

          <div style={{
            backgroundColor: '#F5FCEE',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #9DC3C2',
          }}>
            <p style={{ 
              color: '#4D7298', 
              fontSize: '14px',
              fontWeight: '500',
              margin: 0,
            }}>
              Reference ID: {formId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessPage;

