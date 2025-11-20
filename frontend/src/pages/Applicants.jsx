import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';

function Applicants() {
  const [forms, setForms] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedForms, setExpandedForms] = useState({});

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

  const toggleForm = (formId) => {
    setExpandedForms(prev => ({
      ...prev,
      [formId]: !prev[formId]
    }));
  };

  if (loading) return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        Loading applicants...
      </div>
    </div>
  );

  return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#2d3436', 
            marginBottom: '8px', 
            fontSize: '32px',
            fontWeight: '600',
            letterSpacing: '-0.02em',
          }}>
            Applicants
          </h1>
          <p style={{ color: '#636e72', fontSize: '16px', margin: 0 }}>
            View all responses across all forms ({allResponses.length} total)
          </p>
        </div>

{forms.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
            <p style={{ color: '#737373', fontSize: '18px', marginBottom: '8px' }}>No forms yet.</p>
            <p style={{ color: '#a3a3a3', fontSize: '14px' }}>Create a form to start receiving applications.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {forms.map(form => {
              const formResponses = allResponses.filter(r => r.form_id === form.id);
              const isExpanded = expandedForms[form.id];

              return (
                <div 
                  key={form.id} 
                  style={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                    border: '1px solid #f5f5f4',
                    overflow: 'hidden',
                  }}
                >
                  {/* Collapsible Header */}
                  <div 
                    onClick={() => toggleForm(form.id)}
                    style={{ 
                      padding: '20px 24px',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#F5FCEE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {/* Arrow Icon */}
                      {isExpanded ? (
                        <ChevronDown size={20} color="#4D7298" />
                      ) : (
                        <ChevronRight size={20} color="#4D7298" />
                      )}
                      
                      {/* Form Title */}
                      <h2 style={{ 
                        color: '#0a0a0a',
                        fontSize: '20px',
                        fontWeight: '600',
                        margin: 0,
                        letterSpacing: '-0.01em',
                      }}>
                        {form.name}
                      </h2>
                    </div>
                    
                    {/* Response Count Badge */}
                    <span style={{ 
                      color: '#fff',
                      backgroundColor: formResponses.length > 0 ? '#4D7298' : '#a3a3a3',
                      fontSize: '13px',
                      fontWeight: '600',
                      padding: '6px 12px',
                      borderRadius: '20px',
                    }}>
                      {formResponses.length} {formResponses.length === 1 ? 'response' : 'responses'}
                    </span>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div style={{ 
                      padding: '0 24px 24px 24px',
                      borderTop: '1px solid #f5f5f4',
                    }}>
                      {formResponses.length === 0 ? (
                        <div style={{ 
                          textAlign: 'center', 
                          padding: '40px 20px',
                        }}>
                          <p style={{ color: '#a3a3a3', fontSize: '14px', marginBottom: '16px' }}>
                            No responses yet for this form.
                          </p>
                          <Link 
                            to={`/admin/forms/${form.id}/edit`}
                            style={{ 
                              color: '#4D7298', 
                              textDecoration: 'none',
                              fontSize: '14px',
                              fontWeight: '500',
                            }}
                          >
                            Edit form →
                          </Link>
                        </div>
                      ) : (
                        <>
                          <div style={{ 
                            display: 'flex', 
                            gap: '12px', 
                            marginTop: '20px',
                            marginBottom: '16px',
                          }}>
                            <Link 
                              to={`/admin/forms/${form.id}/responses`}
                              style={{ 
                                color: '#4D7298', 
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#77A6B6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#4D7298';
                              }}
                            >
                              View all responses →
                            </Link>
                            <Link 
                              to={`/admin/forms/${form.id}/edit`}
                              style={{ 
                                color: '#737373', 
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#4D7298';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#737373';
                              }}
                            >
                              Edit form →
                            </Link>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {formResponses.slice(0, 5).map(response => {
                              const data = typeof response.response_data === 'string' 
                                ? JSON.parse(response.response_data) 
                                : response.response_data;
                              
                              // Get first 2 questions and answers
                              const entries = Object.entries(data || {}).slice(0, 2);
                              
                              return (
                                <div 
                                  key={response.id} 
                                  style={{ 
                                    border: '1px solid #f5f5f4', 
                                    padding: '16px', 
                                    borderRadius: '12px',
                                    backgroundColor: '#F5FCEE',
                                    transition: 'all 0.2s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = '#9DC3C2';
                                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(157,195,194,0.2)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = '#f5f5f4';
                                    e.currentTarget.style.boxShadow = 'none';
                                  }}
                                >
                                  {/* Header: Name, Email, Date */}
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <div>
                                      {response.applicant_name && (
                                        <p style={{ 
                                          margin: 0, 
                                          fontWeight: '600',
                                          color: '#0a0a0a',
                                          fontSize: '16px',
                                        }}>
                                          {response.applicant_name}
                                        </p>
                                      )}
                                      {response.applicant_email && (
                                        <p style={{ 
                                          margin: '4px 0 0 0', 
                                          color: '#737373', 
                                          fontSize: '14px' 
                                        }}>
                                          {response.applicant_email}
                                        </p>
                                      )}
                                    </div>
                                    <span style={{ 
                                      fontSize: '12px', 
                                      color: '#a3a3a3',
                                      backgroundColor: 'white',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                    }}>
                                      {new Date(response.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                  </div>

                                  {/* Preview of first 2 questions */}
                                  {entries.length > 0 && (
                                    <div style={{ 
                                      marginTop: '12px',
                                      paddingTop: '12px',
                                      borderTop: '1px solid #e5e5e5',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                    }}>
                                      {entries.map(([question, answer], idx) => (
                                        <div key={idx} style={{ fontSize: '13px' }}>
                                          <span style={{ 
                                            color: '#737373',
                                            fontWeight: '500',
                                          }}>
                                            {question}:{' '}
                                          </span>
                                          <span style={{ color: '#0a0a0a' }}>
                                            {String(answer).length > 80 
                                              ? String(answer).substring(0, 80) + '...' 
                                              : String(answer)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* View details link */}
                                  <Link 
                                    to={`/admin/forms/${form.id}/responses`}
                                    style={{ 
                                      color: '#4D7298', 
                                      textDecoration: 'none',
                                      fontSize: '13px',
                                      fontWeight: '500',
                                      display: 'inline-block',
                                      marginTop: '12px',
                                      transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.color = '#77A6B6';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.color = '#4D7298';
                                    }}
                                  >
                                    View full response →
                                  </Link>
                                </div>
                              );
                            })}
                          </div>
                          
                          {formResponses.length > 5 && (
                            <Link 
                              to={`/admin/forms/${form.id}/responses`}
                              style={{ 
                                color: '#4D7298', 
                                textDecoration: 'none',
                                fontSize: '14px',
                                fontWeight: '500',
                                marginTop: '16px',
                                display: 'inline-block',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#77A6B6';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#4D7298';
                              }}
                            >
                              View {formResponses.length - 5} more {formResponses.length - 5 === 1 ? 'response' : 'responses'} →
                            </Link>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Applicants;

