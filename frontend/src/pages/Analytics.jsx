import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, CheckCircle, XCircle, Clock, BarChart3 } from 'lucide-react';

const Analytics = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [formName, setFormName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
    fetchFormName();
  }, [formId]);

  const fetchFormName = async () => {
    try {
      const response = await fetch(`/api/forms/${formId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFormName(data.name || data.title || 'Application');
      }
    } catch (err) {
      console.error('Failed to fetch form name:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/forms/${formId}/analytics`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getBarWidth = (count, total) => {
    if (total === 0) return '0%';
    return `${(count / total * 100)}%`;
  };

  const getDropoffRate = (currentCount, previousCount) => {
    if (previousCount === 0) return '0';
    const dropoff = ((previousCount - currentCount) / previousCount * 100);
    return dropoff.toFixed(1);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          fontSize: '18px',
          color: '#4D7298',
          fontWeight: '500',
        }}>Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          color: '#e74c3c',
          fontSize: '18px',
          fontWeight: '500',
        }}>Error: {error}</div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { totalApplicants, stageProgression, finalStatus } = analyticsData;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '48px 24px',
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => navigate(`/admin/forms/${formId}/responses`)}
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
              marginBottom: '20px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#77A6B6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#4D7298';
            }}
          >
            <ArrowLeft size={18} />
            Back to Responses
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
            <BarChart3 size={40} style={{ color: '#4D7298' }} />
            <h1 style={{
              color: '#2d3436',
              fontSize: '36px',
              fontWeight: '600',
              letterSpacing: '-0.02em',
              margin: 0,
            }}>
              Analytics Dashboard
            </h1>
          </div>
          <p style={{
            color: '#636e72',
            fontSize: '18px',
            margin: 0,
            fontWeight: '500',
          }}>
            {formName}
          </p>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}>
          {/* Total Applicants */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(77, 114, 152, 0.1)',
            border: '1px solid rgba(77, 114, 152, 0.1)',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(77, 114, 152, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(77, 114, 152, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #77A6B6 0%, #4D7298 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Users size={28} style={{ color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  color: '#636e72',
                  fontSize: '14px',
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Total Applicants</p>
                <p style={{
                  fontSize: '40px',
                  fontWeight: '700',
                  color: '#2d3436',
                  margin: 0,
                  lineHeight: 1,
                }}>{totalApplicants}</p>
              </div>
            </div>
          </div>

          {/* Accepted */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(132, 191, 95, 0.1)',
            border: '1px solid rgba(132, 191, 95, 0.15)',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(132, 191, 95, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(132, 191, 95, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #84BF5F 0%, #6ea84a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <CheckCircle size={28} style={{ color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  color: '#636e72',
                  fontSize: '14px',
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Accepted</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <p style={{
                    fontSize: '40px',
                    fontWeight: '700',
                    color: '#84BF5F',
                    margin: 0,
                    lineHeight: 1,
                  }}>{finalStatus.accepted}</p>
                  <p style={{
                    fontSize: '16px',
                    color: '#84BF5F',
                    fontWeight: '600',
                    margin: 0,
                  }}>
                    {totalApplicants > 0 ? ((finalStatus.accepted / totalApplicants) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(231, 76, 60, 0.1)',
            border: '1px solid rgba(231, 76, 60, 0.15)',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(231, 76, 60, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(231, 76, 60, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <XCircle size={28} style={{ color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  color: '#636e72',
                  fontSize: '14px',
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Rejected</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <p style={{
                    fontSize: '40px',
                    fontWeight: '700',
                    color: '#e74c3c',
                    margin: 0,
                    lineHeight: 1,
                  }}>{finalStatus.rejected}</p>
                  <p style={{
                    fontSize: '16px',
                    color: '#e74c3c',
                    fontWeight: '600',
                    margin: 0,
                  }}>
                    {totalApplicants > 0 ? ((finalStatus.rejected / totalApplicants) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending */}
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 4px 20px rgba(241, 196, 15, 0.1)',
            border: '1px solid rgba(241, 196, 15, 0.15)',
            transition: 'all 0.3s ease',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(241, 196, 15, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(241, 196, 15, 0.1)';
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f1c40f 0%, #d4a017 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Clock size={28} style={{ color: 'white' }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{
                  color: '#636e72',
                  fontSize: '14px',
                  margin: '0 0 8px 0',
                  fontWeight: '500',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>Pending</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <p style={{
                    fontSize: '40px',
                    fontWeight: '700',
                    color: '#f1c40f',
                    margin: 0,
                    lineHeight: 1,
                  }}>{finalStatus.pending}</p>
                  <p style={{
                    fontSize: '16px',
                    color: '#f1c40f',
                    fontWeight: '600',
                    margin: 0,
                  }}>
                    {totalApplicants > 0 ? ((finalStatus.pending / totalApplicants) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progression Funnel */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 8px 32px rgba(77, 114, 152, 0.12)',
          border: '1px solid rgba(77, 114, 152, 0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '36px',
            paddingBottom: '24px',
            borderBottom: '2px solid #f0f0f0',
          }}>
            <TrendingUp size={32} style={{ color: '#4D7298' }} />
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: '#2d3436',
              margin: 0,
              letterSpacing: '-0.01em',
            }}>Stage Progression</h2>
          </div>

          {stageProgression.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#636e72',
              fontSize: '16px',
            }}>
              <Users size={48} style={{ color: '#dfe6e9', marginBottom: '16px' }} />
              <p style={{ margin: 0 }}>No stage data available yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              {/* Starting point - Total Applicants */}
              <div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#4D7298',
                    }}></div>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#2d3436',
                    }}>Application Submitted</span>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: '#77A6B6',
                      marginLeft: '12px',
                    }}>
                      100%
                    </span>
                  </div>
                  <span style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: '#4D7298',
                  }}>{totalApplicants} applicants</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '48px',
                  background: 'linear-gradient(90deg, #e8f4f8 0%, #f0f0f0 100%)',
                  borderRadius: '12px',
                  position: 'relative',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                }}>
                  <div style={{
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #77A6B6 0%, #4D7298 100%)',
                    borderRadius: '12px',
                    transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}>
                  </div>
                </div>
              </div>

              {/* Each stage */}
              {stageProgression.map((stage, index) => {
                const previousCount = index === 0 ? totalApplicants : stageProgression[index - 1].applicantsReached;
                const dropoffRate = getDropoffRate(stage.applicantsReached, previousCount);
                const widthPercent = (stage.applicantsReached / totalApplicants * 100);
                
                return (
                  <div key={stage.stage} style={{ position: 'relative' }}>
                    {/* Connecting line with arrow */}
                    <div style={{
                      position: 'absolute',
                      left: '50%',
                      top: '-24px',
                      transform: 'translateX(-50%)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                    }}>
                      <div style={{
                        width: '2px',
                        height: '16px',
                        background: 'linear-gradient(180deg, #b2bec3 0%, transparent 100%)',
                      }}></div>
                      <div style={{
                        width: '0',
                        height: '0',
                        borderLeft: '6px solid transparent',
                        borderRight: '6px solid transparent',
                        borderTop: '8px solid #b2bec3',
                      }}></div>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: '#9DC3C2',
                        }}></div>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#2d3436',
                        }}>{stage.stage}</span>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '700',
                          color: '#77A6B6',
                          marginLeft: '12px',
                        }}>
                          {stage.percentage}%
                        </span>
                        {dropoffRate > 0 && (
                          <span style={{
                            fontSize: '12px',
                            padding: '4px 12px',
                            background: 'linear-gradient(135deg, #ffe5e5 0%, #ffcccc 100%)',
                            color: '#c0392b',
                            borderRadius: '20px',
                            fontWeight: '600',
                            letterSpacing: '0.3px',
                          }}>
                            -{dropoffRate}% dropoff
                          </span>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#9DC3C2',
                        }}>
                          {stage.applicantsReached} reached
                        </span>
                        {stage.currentlyAt > 0 && (
                          <span style={{
                            fontSize: '13px',
                            color: '#636e72',
                            marginLeft: '8px',
                            fontWeight: '500',
                          }}>
                            ({stage.currentlyAt} currently)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div style={{
                      width: '100%',
                      height: '48px',
                      background: 'linear-gradient(90deg, #e8f4f8 0%, #f0f0f0 100%)',
                      borderRadius: '12px',
                      position: 'relative',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.06)',
                    }}>
                      <div style={{
                        width: getBarWidth(stage.applicantsReached, totalApplicants),
                        height: '100%',
                        background: 'linear-gradient(90deg, #9DC3C2 0%, #77A6B6 100%)',
                        borderRadius: '12px',
                        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Conversion Rate Summary */}
          {stageProgression.length > 0 && (
            <div style={{
              marginTop: '48px',
              paddingTop: '32px',
              borderTop: '2px solid #f0f0f0',
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#2d3436',
                marginBottom: '24px',
              }}>Conversion Insights</h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '24px',
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #e8f8f5 0%, #d5f4e6 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(132, 191, 95, 0.2)',
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#636e72',
                    margin: '0 0 12px 0',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>Overall Acceptance Rate</p>
                  <p style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#84BF5F',
                    margin: '0 0 8px 0',
                  }}>
                    {totalApplicants > 0 ? ((finalStatus.accepted / totalApplicants) * 100).toFixed(1) : 0}%
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#636e72',
                    margin: 0,
                  }}>
                    {finalStatus.accepted} out of {totalApplicants} applicants
                  </p>
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #e8eaf6 0%, #d1d9ff 100%)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: '1px solid rgba(77, 114, 152, 0.2)',
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: '#636e72',
                    margin: '0 0 12px 0',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>In-Process Applicants</p>
                  <p style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    color: '#4D7298',
                    margin: '0 0 8px 0',
                  }}>
                    {totalApplicants - finalStatus.accepted - finalStatus.rejected - finalStatus.pending}
                  </p>
                  <p style={{
                    fontSize: '14px',
                    color: '#636e72',
                    margin: 0,
                  }}>
                    Currently in interview stages
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
