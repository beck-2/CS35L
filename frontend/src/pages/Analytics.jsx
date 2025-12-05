import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, CheckCircle, XCircle, Clock } from 'lucide-react';

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
      const response = await fetch(`http://localhost:5001/api/forms/${formId}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setFormName(data.title || 'Application');
      }
    } catch (err) {
      console.error('Failed to fetch form name:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5001/api/forms/${formId}/analytics`, {
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!analyticsData) return null;

  const { totalApplicants, stageProgression, finalStatus } = analyticsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/forms/${formId}/responses`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Responses
          </button>
          <h1 className="text-4xl font-bold text-gray-800">
            Analytics: {formName}
          </h1>
          <p className="text-gray-600 mt-2">
            Track applicant progression through each stage
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center gap-3">
              <Users className="text-blue-500" size={32} />
              <div>
                <p className="text-gray-600 text-sm">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-800">{totalApplicants}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={32} />
              <div>
                <p className="text-gray-600 text-sm">Accepted</p>
                <p className="text-3xl font-bold text-green-600">{finalStatus.accepted}</p>
                <p className="text-xs text-gray-500">
                  {totalApplicants > 0 ? ((finalStatus.accepted / totalApplicants) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center gap-3">
              <XCircle className="text-red-500" size={32} />
              <div>
                <p className="text-gray-600 text-sm">Rejected</p>
                <p className="text-3xl font-bold text-red-600">{finalStatus.rejected}</p>
                <p className="text-xs text-gray-500">
                  {totalApplicants > 0 ? ((finalStatus.rejected / totalApplicants) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-500" size={32} />
              <div>
                <p className="text-gray-600 text-sm">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{finalStatus.pending}</p>
                <p className="text-xs text-gray-500">
                  {totalApplicants > 0 ? ((finalStatus.pending / totalApplicants) * 100).toFixed(1) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stage Progression Funnel */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-purple-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">Stage Progression</h2>
          </div>

          {stageProgression.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No stage data available yet</p>
          ) : (
            <div className="space-y-6">
              {/* Starting point - Total Applicants */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">Application Submitted</span>
                  <span className="text-sm font-bold text-gray-800">{totalApplicants} applicants</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-10 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end pr-4 transition-all duration-500"
                    style={{ width: '100%' }}
                  >
                    <span className="text-white font-semibold text-sm">100%</span>
                  </div>
                </div>
              </div>

              {/* Each stage */}
              {stageProgression.map((stage, index) => {
                const previousCount = index === 0 ? totalApplicants : stageProgression[index - 1].applicantsReached;
                const dropoffRate = getDropoffRate(stage.applicantsReached, previousCount);
                
                return (
                  <div key={stage.stage} className="relative">
                    {/* Connecting line */}
                    <div className="absolute left-0 -top-3 w-1 h-3 bg-gradient-to-b from-gray-300 to-transparent"></div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">{stage.stage}</span>
                        {dropoffRate > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                            -{dropoffRate}% dropoff
                          </span>
                        )}
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-800">
                          {stage.applicantsReached} reached
                        </span>
                        {stage.currentlyAt > 0 && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({stage.currentlyAt} currently here)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-10 relative overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-full rounded-full flex items-center justify-end pr-4 transition-all duration-500"
                        style={{ width: getBarWidth(stage.applicantsReached, totalApplicants) }}
                      >
                        {stage.applicantsReached > 0 && (
                          <span className="text-white font-semibold text-sm">{stage.percentage}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Conversion Rate Summary */}
          {stageProgression.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Conversion Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">Overall Acceptance Rate</p>
                  <p className="text-2xl font-bold text-green-600">
                    {totalApplicants > 0 ? ((finalStatus.accepted / totalApplicants) * 100).toFixed(1) : 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {finalStatus.accepted} out of {totalApplicants} applicants
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">In-Process Applicants</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {totalApplicants - finalStatus.accepted - finalStatus.rejected - finalStatus.pending}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
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
