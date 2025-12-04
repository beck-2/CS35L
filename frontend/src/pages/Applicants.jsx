import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Download, ArrowUpDown } from 'lucide-react';

function Applicants() {
  const [forms, setForms] = useState([]);
  const [allResponses, setAllResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedForms, setExpandedForms] = useState({});
  const [sortBy, setSortBy] = useState({});  // { formId: 'none' | 'rating-high' | 'rating-low' | 'alpha-az' | 'alpha-za' | 'gradyear-asc' | 'gradyear-desc' }
  const [ratingsData, setRatingsData] = useState({});  // { responseId: { avg_rating, count } }

  // Helper function to get field label from field ID
  const getFieldLabel = (form, fieldId) => {
    if (!form || !form.definition || !form.definition.fields) {
      console.log('Applicants - Form definition not available:', { form, fieldId });
      return fieldId;
    }
    console.log('Applicants - Looking for field:', fieldId, 'in form:', form.name, 'fields:', form.definition.fields);
    const field = form.definition.fields.find(f => f.id === fieldId);
    console.log('Applicants - Found field:', field);
    return field ? field.label : fieldId;
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      console.log('Applicants - Starting fetchForms');
      const formsResponse = await fetch('/api/forms');
      const formsData = await formsResponse.json();
      console.log('Applicants - Fetched forms:', formsData.length);
      
      // Fetch full form details (including definition) for each form
      const fullFormsPromises = formsData.map(form =>
        fetch(`/api/forms/${form.id}`)
          .then(res => res.json())
          .catch(() => form) // Fallback to basic form data if fetch fails
      );
      
      const fullForms = await Promise.all(fullFormsPromises);
      console.log('Applicants - Full forms loaded:', fullForms.length);
      setForms(fullForms);

      // Fetch responses for all forms
      const responsesPromises = fullForms.map(form =>
        fetch(`/api/forms/${form.id}/responses`)
          .then(res => res.json())
          .then(responses => responses.map(r => ({ ...r, form_id: form.id, form_name: form.name })))
          .catch(() => [])
      );

      const allResponsesData = await Promise.all(responsesPromises);
      const flattened = allResponsesData.flat();
      console.log('Applicants - Total responses loaded:', flattened.length);
      setAllResponses(flattened);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchRatings = async (formId, responses) => {
    try {
      const ratingsPromises = responses.map(response =>
        fetch(`/api/responses/${response.id}/ratings/average`)
          .then(res => res.json())
          .then(data => ({ responseId: response.id, ...data }))
          .catch(() => ({ responseId: response.id, average: 0, count: 0 }))
      );

      const ratingsResults = await Promise.all(ratingsPromises);
      const ratingsMap = { ...ratingsData };
      ratingsResults.forEach(r => {
        ratingsMap[r.responseId] = {
          avg_rating: parseFloat(r.average) || 0,
          count: parseInt(r.count) || 0
        };
      });
      setRatingsData(ratingsMap);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const toggleForm = async (formId) => {
    console.log('Applicants - Toggling form:', formId);
    const isExpanding = !expandedForms[formId];
    setExpandedForms(prev => ({
      ...prev,
      [formId]: isExpanding
    }));
    
    // Fetch ratings only when expanding a form for the first time
    if (isExpanding) {
      const formResponses = allResponses.filter(r => r.form_id === formId);
      console.log('Applicants - Form responses:', formResponses.length);
      // Only fetch if we don't have ratings for these responses yet
      const needsRatings = formResponses.some(r => !ratingsData[r.id]);
      console.log('Applicants - Needs ratings:', needsRatings);
      if (needsRatings && formResponses.length > 0) {
        console.log('Applicants - Fetching ratings for', formResponses.length, 'responses');
        await fetchRatings(formId, formResponses);
      }
    }
  };

  // Helper to find graduation year field in a form
  const findGradYearField = (form) => {
    if (!form || !form.definition || !form.definition.fields) return null;
    
    const gradYearField = form.definition.fields.find(field => {
      const label = field.label.toLowerCase();
      return label.includes('grad') && (label.includes('year') || label.includes('date'));
    });
    
    return gradYearField;
  };

  // Helper to extract graduation year from response data
  const getGradYear = (responseData, gradYearFieldId) => {
    if (!gradYearFieldId || !responseData) return null;
    
    const value = responseData[gradYearFieldId];
    if (!value) return null;
    
    // Try to parse year from various formats
    const yearMatch = String(value).match(/\d{4}/);
    return yearMatch ? parseInt(yearMatch[0]) : null;
  };

  // Helper to extract name from response (memoized per response)
  const getResponseName = (response, form) => {
    if (response.applicant_name) return response.applicant_name;
    
    try {
      const data = typeof response.response_data === 'string' 
        ? JSON.parse(response.response_data) 
        : response.response_data;
      
      const nameField = form.definition?.fields?.find(f => 
        f.label?.toLowerCase().includes('name')
      );
      
      return nameField && data ? (data[nameField.id] || '') : '';
    } catch (e) {
      return '';
    }
  };

  // Sort responses based on selected criteria
  const getSortedResponses = (form, responses) => {
    const sortCriteria = sortBy[form.id] || 'none';
    if (sortCriteria === 'none' || !responses || responses.length === 0) return responses;

    // Create a shallow copy to avoid mutating original
    const sorted = [...responses];

    try {
      switch (sortCriteria) {
        case 'rating-high':
          return sorted.sort((a, b) => {
            const ratingA = ratingsData[a.id]?.avg_rating || 0;
            const ratingB = ratingsData[b.id]?.avg_rating || 0;
            return ratingB - ratingA;
          });
        
        case 'rating-low':
          return sorted.sort((a, b) => {
            const ratingA = ratingsData[a.id]?.avg_rating || 0;
            const ratingB = ratingsData[b.id]?.avg_rating || 0;
            return ratingA - ratingB;
          });
        
        case 'alpha-az':
          return sorted.sort((a, b) => {
            const nameA = getResponseName(a, form).toLowerCase();
            const nameB = getResponseName(b, form).toLowerCase();
            return nameA.localeCompare(nameB);
          });
        
        case 'alpha-za':
          return sorted.sort((a, b) => {
            const nameA = getResponseName(a, form).toLowerCase();
            const nameB = getResponseName(b, form).toLowerCase();
            return nameB.localeCompare(nameA);
          });
        
        case 'gradyear-asc':
        case 'gradyear-desc': {
          const gradYearField = findGradYearField(form);
          if (!gradYearField) return sorted;
          
          return sorted.sort((a, b) => {
            try {
              const dataA = typeof a.response_data === 'string' 
                ? JSON.parse(a.response_data) 
                : a.response_data;
              const dataB = typeof b.response_data === 'string' 
                ? JSON.parse(b.response_data) 
                : b.response_data;
              
              const yearA = getGradYear(dataA, gradYearField.id);
              const yearB = getGradYear(dataB, gradYearField.id);
              
              if (yearA === null && yearB === null) return 0;
              if (yearA === null) return 1;
              if (yearB === null) return -1;
              
              return sortCriteria === 'gradyear-asc' ? yearA - yearB : yearB - yearA;
            } catch (e) {
              return 0;
            }
          });
        }
        
        default:
          return sorted;
      }
    } catch (error) {
      console.error('Error sorting responses:', error);
      return responses;
    }
  };

  const handleExportCSV = async (formId, event) => {
    event.stopPropagation();

    try {
      const response = await fetch(`/api/forms/${formId}/responses/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'responses-export.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Create blob and trigger download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export CSV. Please try again.');
    }
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
                            flexWrap: 'wrap',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
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
                              <button
                                onClick={(e) => handleExportCSV(form.id, e)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  color: '#28a745',
                                  textDecoration: 'none',
                                  fontSize: '14px',
                                  fontWeight: '500',
                                  transition: 'all 0.2s ease',
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '0',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.color = '#218838';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.color = '#28a745';
                                }}
                              >
                                <Download size={14} />
                                Export CSV
                              </button>
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

                            {/* Sort Dropdown */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <ArrowUpDown size={16} color="#737373" />
                              <select
                                value={sortBy[form.id] || 'none'}
                                onChange={(e) => setSortBy(prev => ({ ...prev, [form.id]: e.target.value }))}
                                style={{
                                  padding: '6px 12px',
                                  fontSize: '14px',
                                  border: '1px solid #e5e5e5',
                                  borderRadius: '8px',
                                  backgroundColor: 'white',
                                  color: '#0a0a0a',
                                  cursor: 'pointer',
                                  fontWeight: '500',
                                  outline: 'none',
                                  transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#9DC3C2';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#e5e5e5';
                                }}
                              >
                                <option value="none">No sorting</option>
                                <option value="rating-high">Rating: High to Low</option>
                                <option value="rating-low">Rating: Low to High</option>
                                <option value="alpha-az">Name: A-Z</option>
                                <option value="alpha-za">Name: Z-A</option>
                                {findGradYearField(form) && (
                                  <>
                                    <option value="gradyear-asc">Grad Year: Earliest First</option>
                                    <option value="gradyear-desc">Grad Year: Latest First</option>
                                  </>
                                )}
                              </select>
                            </div>
                          </div>
                          
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {getSortedResponses(form, formResponses).slice(0, 5).map(response => {
                              let data = {};
                              let entries = [];
                              
                              try {
                                data = typeof response.response_data === 'string' 
                                  ? JSON.parse(response.response_data) 
                                  : response.response_data;
                                
                                // Get first 2 questions and answers
                                entries = Object.entries(data || {}).slice(0, 2);
                              } catch (error) {
                                console.error('Error parsing response data:', error);
                              }
                              
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
                                  {/* Header: Name, Email, Date, Rating */}
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
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                      <span style={{ 
                                        fontSize: '12px', 
                                        color: '#a3a3a3',
                                        backgroundColor: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                      }}>
                                        {new Date(response.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                      </span>
                                      {ratingsData[response.id]?.count > 0 && (
                                        <span style={{ 
                                          fontSize: '12px', 
                                          color: '#fbbf24',
                                          backgroundColor: 'white',
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontWeight: '600',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px',
                                        }}>
                                          ★ {(parseFloat(ratingsData[response.id].avg_rating) || 0).toFixed(1)}
                                          <span style={{ color: '#a3a3a3', fontWeight: '400' }}>
                                            ({ratingsData[response.id].count})
                                          </span>
                                        </span>
                                      )}
                                    </div>
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
                                      {entries.map(([fieldId, answer], idx) => {
                                        const label = getFieldLabel(form, fieldId);
                                        
                                        return (
                                        <div key={idx} style={{ fontSize: '13px' }}>
                                          <span style={{ 
                                            color: '#737373',
                                            fontWeight: '500',
                                          }}>
                                            {label}:{' '}
                                          </span>
                                          <span style={{ color: '#0a0a0a' }}>
                                            {String(answer).length > 80 
                                              ? String(answer).substring(0, 80) + '...' 
                                              : String(answer)}
                                          </span>
                                        </div>
                                        );
                                      })}
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

