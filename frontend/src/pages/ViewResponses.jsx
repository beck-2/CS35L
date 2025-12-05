import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ChevronRight, Download, FileText, ArrowLeft, Check, X } from 'lucide-react';
import RatingForm from '../components/RatingForm';
import RatingsList from '../components/RatingsList';

/**
 * ViewResponses - Displays all form responses with ratings capability
 * Separates concerns: UI display vs rating logic (handled by child components)
 */
function ViewResponses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedResponses, setExpandedResponses] = useState({});
  // Rating state keyed by response ID for efficient lookups
  const [ratings, setRatings] = useState({});
  const [averages, setAverages] = useState({});
  const [isSubmitting, setIsSubmitting] = useState({});
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [showStageDropdown, setShowStageDropdown] = useState({});
  const [sortBy, setSortBy] = useState('none'); // 'none' | 'status-accepted' | 'status-rejected' | 'status-pending' | 'status-stages'

  // Helper function to get field label from field ID
  const getFieldLabel = (fieldId) => {
    if (!form || !form.definition || !form.definition.fields) {
      console.log('Form definition not available:', { form, fieldId });
      return fieldId;
    }
    console.log('Looking for field:', fieldId, 'in fields:', form.definition.fields);
    const field = form.definition.fields.find(f => f.id === fieldId);
    console.log('Found field:', field);
    return field ? field.label : fieldId;
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/forms/${id}`).then(res => res.json()),
      fetch(`/api/forms/${id}/responses`).then(res => res.json()),
      fetch(`/api/events`).then(res => res.json())
    ])
      .then(([formData, responsesData, eventsData]) => {
        setForm(formData);
        setResponses(responsesData);
        // Filter out Application and Acceptance events, keep everything in between
        const stages = eventsData.filter(e => e.name !== 'Application' && e.name !== 'Acceptance');
        setTimelineEvents(stages);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, [id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowStageDropdown({});
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Sort responses based on status
  const getSortedResponses = () => {
    if (sortBy === 'none' || !responses || responses.length === 0) return responses;
    
    const sorted = [...responses];
    
    const getStatusPriority = (status) => {
      if (status === 'accepted') return 1;
      if (status === 'rejected') return 3;
      if (status === 'pending' || !status) return 4;
      return 2; // in-progress stages
    };
    
    switch (sortBy) {
      case 'status-accepted':
        // Sort: accepted -> in-progress -> rejected -> pending
        return sorted.sort((a, b) => {
          const aStatus = a.status || 'pending';
          const bStatus = b.status || 'pending';
          const aPriority = getStatusPriority(aStatus);
          const bPriority = getStatusPriority(bStatus);
          return aPriority - bPriority;
        });
      case 'status-rejected':
        return sorted.sort((a, b) => {
          const aStatus = a.status || 'pending';
          const bStatus = b.status || 'pending';
          if (aStatus === 'rejected' && bStatus !== 'rejected') return -1;
          if (aStatus !== 'rejected' && bStatus === 'rejected') return 1;
          return 0;
        });
      case 'status-pending':
        return sorted.sort((a, b) => {
          const aStatus = a.status || 'pending';
          const bStatus = b.status || 'pending';
          if (aStatus === 'pending' && bStatus !== 'pending') return -1;
          if (aStatus !== 'pending' && bStatus === 'pending') return 1;
          return 0;
        });
      case 'status-stages':
        // Sort by in-progress stages (anything that's not accepted/rejected/pending)
        return sorted.sort((a, b) => {
          const aStatus = a.status || 'pending';
          const bStatus = b.status || 'pending';
          const aIsStage = aStatus !== 'accepted' && aStatus !== 'rejected' && aStatus !== 'pending';
          const bIsStage = bStatus !== 'accepted' && bStatus !== 'rejected' && bStatus !== 'pending';
          if (aIsStage && !bIsStage) return -1;
          if (!aIsStage && bIsStage) return 1;
          return 0;
        });
      default:
        return sorted;
    }
  };

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
      // fetch both ratings and average in parallel for better performance
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

  const submitRating = async (responseId, ratingData) => {
    setIsSubmitting(prev => ({ ...prev, [responseId]: true }));

    try {
      const response = await fetch(`/api/responses/${responseId}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ratingData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit rating');
      }

      // refresh ratings after successful submit
      await fetchRatings(responseId);
      console.log('Rating submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting rating:', error);
      return false;
    } finally {
      setIsSubmitting(prev => ({ ...prev, [responseId]: false }));
    }
  };

  const updateStatus = async (responseId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [responseId]: true }));

    try {
      const response = await fetch(`/api/responses/${responseId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedResponse = await response.json();
      
      // Update local state
      setResponses(prev => 
        prev.map(r => r.id === responseId ? { ...r, status: updatedResponse.status } : r)
      );

      return true;
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
      return false;
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [responseId]: false }));
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await fetch(`/api/forms/${id}/responses/export`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Extract filename from Content-Disposition header or use default
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
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={handleExportCSV}
                disabled={responses.length === 0}
                style={{
                  padding: '10px 20px',
                  backgroundColor: responses.length === 0 ? '#cccccc' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: responses.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  opacity: responses.length === 0 ? 0.6 : 1,
                }}
                onMouseEnter={(e) => {
                  if (responses.length > 0) {
                    e.currentTarget.style.backgroundColor = '#218838';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (responses.length > 0) {
                    e.currentTarget.style.backgroundColor = '#28a745';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}>
                <Download size={16} />
                Export CSV
              </button>
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
            {/* Sort Dropdown */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px',
              marginBottom: '8px'
            }}>
              <label style={{ 
                fontSize: '14px', 
                fontWeight: '500', 
                color: '#2d3436' 
              }}>
                Sort by:
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '8px 12px',
                  fontSize: '14px',
                  borderRadius: '8px',
                  border: '1px solid #dee2e6',
                  backgroundColor: 'white',
                  color: '#2d3436',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#4D7298';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#dee2e6';
                }}
              >
                <option value="none">Default (Newest First)</option>
                <option value="status-accepted">Accepted First</option>
                <option value="status-rejected">Rejected First</option>
                <option value="status-pending">Pending First</option>
                <option value="status-stages">In Progress First</option>
              </select>
            </div>

            {getSortedResponses().map(response => {
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
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Status Badge */}
                        <span style={{ 
                          fontSize: '12px', 
                          fontWeight: '600',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: 
                            response.status === 'accepted' ? '#d4edda' : 
                            response.status === 'rejected' ? '#f8d7da' : 
                            response.status === 'pending' ? '#e2e8f0' :
                            '#fff3cd', // Yellow for in-progress stages
                          color: 
                            response.status === 'accepted' ? '#155724' : 
                            response.status === 'rejected' ? '#721c24' : 
                            response.status === 'pending' ? '#475569' :
                            '#856404', // Dark yellow for in-progress stages
                          textTransform: 'capitalize',
                        }}>
                          {response.status || 'pending'}
                        </span>

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
                        {Object.entries(data).slice(0, 2).map(([fieldId, answer], idx) => {
                          // Skip file uploads in preview
                          if (typeof answer === 'string' && answer.startsWith('file:')) {
                            return null;
                          }
                          
                          const label = getFieldLabel(fieldId);
                          
                          return (
                            <div key={idx} style={{ fontSize: '13px' }}>
                              <span style={{ 
                                color: '#737373',
                                fontWeight: '500',
                              }}>
                                {label}:{' '}
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
                        {Object.entries(data).map(([fieldId, value]) => {
                          const label = getFieldLabel(fieldId);
                          
                          return (
                          <div 
                            key={fieldId} 
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
                              {label}
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
                          );
                        })}
                      </div>

                      {/* Rating Section */}
                      <div style={{
                        marginTop: '32px',
                        paddingTop: '24px',
                        borderTop: '2px solid #e5e5e5',
                      }}>
                        {/* Accept/Reject Buttons */}
                        <div style={{ 
                          marginBottom: '24px',
                          display: 'flex',
                          gap: '12px',
                          alignItems: 'center',
                        }}>
                          <h3 style={{ 
                            margin: 0,
                            fontSize: '16px',
                            fontWeight: '600',
                            color: '#2d3436',
                            marginRight: 'auto',
                          }}>
                            Application Status
                          </h3>
                          
                          {/* Advance Stage Dropdown */}
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowStageDropdown(prev => ({
                                  ...prev,
                                  [response.id]: !prev[response.id]
                                }));
                              }}
                              disabled={updatingStatus[response.id] || response.status === 'rejected' || response.status === 'accepted'}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '10px 20px',
                                backgroundColor: response.status === 'rejected' || response.status === 'accepted' ? '#e9ecef' : '#28a745',
                                color: response.status === 'rejected' || response.status === 'accepted' ? '#6c757d' : 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                cursor: (response.status === 'rejected' || response.status === 'accepted' || updatingStatus[response.id]) ? 'not-allowed' : 'pointer',
                                opacity: updatingStatus[response.id] ? 0.6 : 1,
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (response.status !== 'rejected' && response.status !== 'accepted' && !updatingStatus[response.id]) {
                                  e.currentTarget.style.backgroundColor = '#218838';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (response.status !== 'rejected' && response.status !== 'accepted') {
                                  e.currentTarget.style.backgroundColor = '#28a745';
                                }
                              }}
                            >
                              <Check size={16} />
                              Advance Stage
                              <ChevronDown size={16} />
                            </button>

                            {/* Dropdown Menu */}
                            {showStageDropdown[response.id] && (
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '100%',
                                  left: 0,
                                  marginTop: '4px',
                                  backgroundColor: 'white',
                                  border: '1px solid #dee2e6',
                                  borderRadius: '8px',
                                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                  minWidth: '200px',
                                  zIndex: 1000,
                                  overflow: 'hidden',
                                }}
                              >
                                {timelineEvents.map((event, idx) => (
                                  <button
                                    key={event.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateStatus(response.id, event.name);
                                      setShowStageDropdown(prev => ({
                                        ...prev,
                                        [response.id]: false
                                      }));
                                    }}
                                    style={{
                                      width: '100%',
                                      padding: '12px 16px',
                                      border: 'none',
                                      borderBottom: idx < timelineEvents.length ? '1px solid #f0f0f0' : 'none',
                                      backgroundColor: 'white',
                                      textAlign: 'left',
                                      cursor: 'pointer',
                                      fontSize: '14px',
                                      color: '#2d3436',
                                      transition: 'background-color 0.2s ease',
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.backgroundColor = 'white';
                                    }}
                                  >
                                    {event.name}
                                  </button>
                                ))}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateStatus(response.id, 'accepted');
                                    setShowStageDropdown(prev => ({
                                      ...prev,
                                      [response.id]: false
                                    }));
                                  }}
                                  style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    border: 'none',
                                    backgroundColor: '#d4edda',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    color: '#155724',
                                    fontWeight: '600',
                                    transition: 'background-color 0.2s ease',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#c3e6cb';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = '#d4edda';
                                  }}
                                >
                                  ✓ Accept (Final)
                                </button>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateStatus(response.id, 'rejected');
                            }}
                            disabled={updatingStatus[response.id] || response.status === 'rejected'}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '10px 20px',
                              backgroundColor: response.status === 'rejected' ? '#f8d7da' : '#dc3545',
                              color: response.status === 'rejected' ? '#721c24' : 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '14px',
                              fontWeight: '600',
                              cursor: response.status === 'rejected' || updatingStatus[response.id] ? 'not-allowed' : 'pointer',
                              opacity: updatingStatus[response.id] ? 0.6 : 1,
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              if (response.status !== 'rejected' && !updatingStatus[response.id]) {
                                e.currentTarget.style.backgroundColor = '#c82333';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (response.status !== 'rejected') {
                                e.currentTarget.style.backgroundColor = '#dc3545';
                              }
                            }}
                          >
                            <X size={16} />
                            {response.status === 'rejected' ? 'Rejected' : 'Reject'}
                          </button>

                          {response.status !== 'pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateStatus(response.id, 'pending');
                              }}
                              disabled={updatingStatus[response.id]}
                              style={{
                                padding: '10px 16px',
                                backgroundColor: 'white',
                                color: '#4D7298',
                                border: '1px solid #4D7298',
                                borderRadius: '8px',
                                fontSize: '13px',
                                fontWeight: '500',
                                cursor: updatingStatus[response.id] ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                if (!updatingStatus[response.id]) {
                                  e.currentTarget.style.backgroundColor = '#F5FCEE';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                              }}
                            >
                              Reset to Pending
                            </button>
                          )}
                        </div>

                        <RatingsList
                          ratings={ratings[response.id]}
                          average={averages[response.id]}
                        />

                        <RatingForm
                          onSubmit={(ratingData) => submitRating(response.id, ratingData)}
                          isSubmitting={isSubmitting[response.id]}
                        />
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

