import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Download, FileText, ArrowLeft } from 'lucide-react';

function ViewResponses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResponses, setExpandedResponses] = useState({});
  const [ratings, setRatings] = useState({});
  const [averages, setAverages] = useState({});
  const [newRating, setNewRating] = useState({});
  const [hoveredStar, setHoveredStar] = useState({});

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

  const toggleResponse = async (responseId) => {
    const wasExpanded = expandedResponses[responseId];
    setExpandedResponses(prev => ({
      ...prev,
      [responseId]: !prev[responseId]
    }));

    // Fetch ratings when expanding
    if (!wasExpanded && !ratings[responseId]) {
      fetchRatings(responseId);
    }
  };

  const fetchRatings = async (responseId) => {
    try {
      const [ratingsRes, avgRes] = await Promise.all([
        fetch(`/api/responses/${responseId}/ratings`),
        fetch(`/api/responses/${responseId}/ratings/average`)
      ]);
      const ratingsData = await ratingsRes.json();
      const avgData = await avgRes.json();

      setRatings(prev => ({ ...prev, [responseId]: ratingsData }));
      setAverages(prev => ({ ...prev, [responseId]: avgData }));
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const submitRating = async (responseId) => {
    const rating = newRating[responseId];
    if (!rating?.reviewer_name || !rating?.rating) {
      alert('Please enter your name and select a rating');
      return;
    }

    try {
      await fetch(`/api/responses/${responseId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rating)
      });

      // Clear form and refresh ratings
      setNewRating(prev => ({ ...prev, [responseId]: {} }));
      fetchRatings(responseId);
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    }
  };

  const updateNewRating = (responseId, field, value) => {
    setNewRating(prev => ({
      ...prev,
      [responseId]: { ...prev[responseId], [field]: value }
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
        <div>Loading responses...</div>
      </div>
    </div>
  );
  
  if (!form) return (
    <div style={{ 
      padding: '20px', 
      paddingTop: '90px',
      backgroundColor: '#F5FCEE',
      minHeight: '100vh',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div>Form not found</div>
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
        {/* Header Section */}
        <div style={{ marginBottom: '32px' }}>
          <button
            onClick={() => navigate('/admin/applicants')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'none',
              border: 'none',
              color: '#4D7298',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              padding: '8px 0',
              marginBottom: '16px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#77A6B6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4D7298';
            }}
          >
            <ArrowLeft size={16} />
            Back to Applicants
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ 
                color: '#2d3436', 
                marginBottom: '8px', 
                fontSize: '32px',
                fontWeight: '600',
                letterSpacing: '-0.02em',
              }}>
                {form.name}
              </h1>
              <p style={{ color: '#636e72', fontSize: '16px', margin: 0 }}>
                {responses.length} {responses.length === 1 ? 'response' : 'responses'}
              </p>
            </div>
            <Link 
              to={`/admin/forms/${id}/edit`}
              style={{ textDecoration: 'none' }}
            >
              <button style={{
                padding: '10px 20px',
                backgroundColor: '#4D7298',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#77A6B6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#4D7298';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                <FileText size={16} />
                Edit Form
              </button>
            </Link>
          </div>
        </div>

        {/* Responses List */}
        {responses.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '16px',
            boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
          }}>
            <FileText size={48} color="#a3a3a3" style={{ marginBottom: '16px' }} />
            <p style={{ color: '#737373', fontSize: '18px', marginBottom: '8px' }}>No responses yet</p>
            <p style={{ color: '#a3a3a3', fontSize: '14px' }}>Share your form to start receiving applications.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {responses.map(response => {
              const data = typeof response.response_data === 'string' 
                ? JSON.parse(response.response_data) 
                : response.response_data;
              const isExpanded = expandedResponses[response.id];
              
              return (
                <div 
                  key={response.id} 
                  style={{ 
                    backgroundColor: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
                    border: '1px solid #f5f5f4',
                    overflow: 'hidden',
                  }}
                >
                  {/* Response Header - Collapsible */}
                  <div 
                    onClick={() => toggleResponse(response.id)}
                    style={{ 
                      padding: '20px 24px',
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExpanded ? 0 : '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        {/* Arrow Icon */}
                        {isExpanded ? (
                          <ChevronDown size={20} color="#4D7298" />
                        ) : (
                          <ChevronRight size={20} color="#4D7298" />
                        )}
                        
                        {/* Applicant Info */}
                        <div>
                          {response.applicant_name && (
                            <p style={{ 
                              margin: 0, 
                              fontWeight: '600',
                              color: '#0a0a0a',
                              fontSize: '18px',
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
                      </div>
                      
                      {/* Submission Date */}
                      <span style={{ 
                        fontSize: '13px', 
                        color: '#a3a3a3',
                        backgroundColor: '#F5FCEE',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontWeight: '500',
                      }}>
                        {new Date(response.submitted_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>

                    {/* Preview of first 2 questions when collapsed */}
                    {!isExpanded && Object.entries(data).length > 0 && (
                      <div style={{ 
                        marginTop: '12px',
                        marginLeft: '32px',
                        paddingTop: '12px',
                        borderTop: '1px solid #e5e5e5',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}>
                        {Object.entries(data).slice(0, 2).map(([question, answer], idx) => {
                          // Skip file uploads in preview
                          if (typeof answer === 'string' && answer.startsWith('file:')) {
                            return null;
                          }
                          
                          return (
                            <div key={idx} style={{ fontSize: '13px' }}>
                              <span style={{ 
                                color: '#737373',
                                fontWeight: '500',
                              }}>
                                {question}:{' '}
                              </span>
                              <span style={{ color: '#0a0a0a' }}>
                                {Array.isArray(answer) 
                                  ? answer.join(', ')
                                  : String(answer).length > 80 
                                    ? String(answer).substring(0, 80) + '...' 
                                    : String(answer)}
                              </span>
                            </div>
                          );
                        })}
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#4D7298',
                          marginTop: '4px',
                          fontWeight: '500',
                        }}>
                          Click to view full response
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Expanded Response Data */}
                  {isExpanded && (
                    <div style={{ 
                      padding: '0 24px 24px 24px',
                      borderTop: '1px solid #f5f5f4',
                    }}>
                      <div style={{ 
                        marginTop: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                      }}>
                        {Object.entries(data).map(([key, value]) => (
                          <div 
                            key={key} 
                            style={{ 
                              padding: '16px',
                              backgroundColor: '#F5FCEE',
                              borderRadius: '12px',
                              border: '1px solid #e5e5e5',
                            }}
                          >
                            <p style={{ 
                              margin: '0 0 8px 0',
                              fontWeight: '600',
                              color: '#4D7298',
                              fontSize: '14px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                            }}>
                              {key}
                            </p>
                            <div style={{ 
                              color: '#0a0a0a',
                              fontSize: '15px',
                              lineHeight: '1.6',
                            }}>
                              {typeof value === 'string' && value.startsWith('file:') ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                                  <span style={{ 
                                    color: '#4D7298',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                  }}>
                                    <FileText size={16} />
                                    File uploaded
                                  </span>
                                  <a 
                                    href={`/api/files/${value.replace('file:', '')}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      color: '#4D7298',
                                      textDecoration: 'none',
                                      fontWeight: '500',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      backgroundColor: 'white',
                                      borderRadius: '6px',
                                      border: '1px solid #9DC3C2',
                                      fontSize: '13px',
                                      transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#9DC3C2';
                                      e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                      e.currentTarget.style.color = '#4D7298';
                                    }}
                                  >
                                    <FileText size={14} />
                                    View
                                  </a>
                                  <a 
                                    href={`/api/files/${value.replace('file:', '')}/download`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    style={{ 
                                      color: '#4D7298',
                                      textDecoration: 'none',
                                      fontWeight: '500',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '6px 12px',
                                      backgroundColor: 'white',
                                      borderRadius: '6px',
                                      border: '1px solid #77A6B6',
                                      fontSize: '13px',
                                      transition: 'all 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#77A6B6';
                                      e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                      e.currentTarget.style.color = '#4D7298';
                                    }}
                                  >
                                    <Download size={14} />
                                    Download
                                  </a>
                                </div>
                              ) : Array.isArray(value) ? (
                                <div style={{ 
                                  display: 'flex', 
                                  flexWrap: 'wrap', 
                                  gap: '8px' 
                                }}>
                                  {value.map((item, idx) => (
                                    <span 
                                      key={idx}
                                      style={{
                                        padding: '4px 12px',
                                        backgroundColor: 'white',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        border: '1px solid #9DC3C2',
                                        color: '#4D7298',
                                      }}
                                    >
                                      {String(item)}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <div style={{ whiteSpace: 'pre-wrap' }}>{String(value)}</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Rating Section */}
                      <div style={{
                        marginTop: '32px',
                        paddingTop: '24px',
                        borderTop: '2px solid #e5e5e5',
                      }}>
                        {/* Average Rating Display */}
                        {averages[response.id] && averages[response.id].count > 0 && (
                          <div style={{
                            marginBottom: '24px',
                            padding: '16px',
                            backgroundColor: '#F5FCEE',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                          }}>
                            <span style={{
                              fontSize: '32px',
                              fontWeight: '700',
                              color: '#4D7298',
                            }}>
                              {averages[response.id].average}
                            </span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: '14px', color: '#737373', marginBottom: '4px' }}>
                                Average Rating
                              </div>
                              <div style={{ fontSize: '12px', color: '#a3a3a3' }}>
                                {averages[response.id].count} {averages[response.id].count === 1 ? 'review' : 'reviews'}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Add New Rating Form */}
                        <div style={{
                          padding: '20px',
                          backgroundColor: 'white',
                          borderRadius: '12px',
                          border: '1px solid #e5e5e5',
                          marginBottom: '24px',
                        }}>
                          <h3 style={{
                            margin: '0 0 16px 0',
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#0a0a0a',
                          }}>
                            Add Your Rating
                          </h3>

                          {/* Reviewer Name */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{
                              display: 'block',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#737373',
                              marginBottom: '6px',
                            }}>
                              Your Name *
                            </label>
                            <input
                              type="text"
                              value={newRating[response.id]?.reviewer_name || ''}
                              onChange={(e) => updateNewRating(response.id, 'reviewer_name', e.target.value)}
                              placeholder="Enter your name"
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          {/* Star Rating */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{
                              display: 'block',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#737373',
                              marginBottom: '6px',
                            }}>
                              Rating *
                            </label>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              {[1, 2, 3, 4, 5].map(star => {
                                const currentRating = newRating[response.id]?.rating || 0;
                                const hovered = hoveredStar[response.id] || 0;
                                const filled = star <= (hovered || currentRating);

                                return (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => updateNewRating(response.id, 'rating', star)}
                                    onMouseEnter={() => setHoveredStar(prev => ({ ...prev, [response.id]: star }))}
                                    onMouseLeave={() => setHoveredStar(prev => ({ ...prev, [response.id]: 0 }))}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '32px',
                                      padding: '4px',
                                      transition: 'transform 0.2s',
                                    }}
                                    onMouseDown={(e) => {
                                      e.currentTarget.style.transform = 'scale(0.9)';
                                    }}
                                    onMouseUp={(e) => {
                                      e.currentTarget.style.transform = 'scale(1)';
                                    }}
                                  >
                                    {filled ? '⭐' : '☆'}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Comment */}
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{
                              display: 'block',
                              fontSize: '13px',
                              fontWeight: '500',
                              color: '#737373',
                              marginBottom: '6px',
                            }}>
                              Comment (optional)
                            </label>
                            <textarea
                              value={newRating[response.id]?.comment || ''}
                              onChange={(e) => updateNewRating(response.id, 'comment', e.target.value)}
                              placeholder="Add your feedback..."
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                fontSize: '14px',
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                boxSizing: 'border-box',
                              }}
                            />
                          </div>

                          {/* Submit Button */}
                          <button
                            onClick={() => submitRating(response.id)}
                            style={{
                              padding: '10px 20px',
                              backgroundColor: '#4D7298',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontWeight: '500',
                              fontSize: '14px',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#77A6B6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#4D7298';
                            }}
                          >
                            Submit Rating
                          </button>
                        </div>

                        {/* Existing Ratings List */}
                        {ratings[response.id] && ratings[response.id].length > 0 && (
                          <div>
                            <h3 style={{
                              margin: '0 0 16px 0',
                              fontSize: '16px',
                              fontWeight: '600',
                              color: '#0a0a0a',
                            }}>
                              Reviews ({ratings[response.id].length})
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              {ratings[response.id].map(rating => (
                                <div
                                  key={rating.id}
                                  style={{
                                    padding: '16px',
                                    backgroundColor: 'white',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e5e5',
                                  }}
                                >
                                  <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'start',
                                    marginBottom: '8px',
                                  }}>
                                    <div>
                                      <div style={{
                                        fontWeight: '600',
                                        color: '#0a0a0a',
                                        fontSize: '14px',
                                      }}>
                                        {rating.reviewer_name}
                                      </div>
                                      {rating.reviewer_email && (
                                        <div style={{
                                          fontSize: '12px',
                                          color: '#a3a3a3',
                                          marginTop: '2px',
                                        }}>
                                          {rating.reviewer_email}
                                        </div>
                                      )}
                                    </div>
                                    <div style={{ display: 'flex', gap: '2px' }}>
                                      {[...Array(5)].map((_, i) => (
                                        <span key={i} style={{ fontSize: '16px' }}>
                                          {i < rating.rating ? '⭐' : '☆'}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  {rating.comment && (
                                    <div style={{
                                      fontSize: '14px',
                                      color: '#0a0a0a',
                                      lineHeight: '1.5',
                                      marginTop: '8px',
                                    }}>
                                      {rating.comment}
                                    </div>
                                  )}
                                  <div style={{
                                    fontSize: '11px',
                                    color: '#a3a3a3',
                                    marginTop: '8px',
                                  }}>
                                    {new Date(rating.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
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

export default ViewResponses;

