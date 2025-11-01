// src/pages/CandidateDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI, recommendationsAPI } from '../services/api';
import JobCard from '../components/JobCard';
import RecommendationList from '../components/RecommendationList';
import ProfileForm from '../components/ProfileForm';

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recommendations');
  const [jobs, setJobs] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'recommendations') {
        const res = await recommendationsAPI.getRecommendations();
        setRecommendations(res.data);
      } else if (activeTab === 'browse') {
        const res = await jobsAPI.getAllJobs();
        setJobs(res.data.jobs);
      } else if (activeTab === 'applications') {
        const res = await applicationsAPI.getMyApplications();
        setApplications(res.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async () => {
    setGenerating(true);
    try {
      const res = await recommendationsAPI.generateRecommendations();
      alert(`Generated ${res.data.count} recommendations!`);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.fullName || user?.email}!
        </h1>
        <p className="text-gray-600 mt-2">Find your perfect job match</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['recommendations', 'browse', 'applications', 'profile'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'recommendations' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Job Recommendations</h2>
              <button
                onClick={handleGenerateRecommendations}
                disabled={generating}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {generating ? 'Generating...' : '🔄 Generate Recommendations'}
              </button>
            </div>
            {loading ? (
              <p>Loading recommendations...</p>
            ) : recommendations.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-6 text-center">
                <p className="text-yellow-800 mb-4">
                  No recommendations yet. Generate recommendations to see jobs matched to your profile!
                </p>
              </div>
            ) : (
              <RecommendationList recommendations={recommendations} onUpdate={loadData} />
            )}
          </div>
        )}

        {activeTab === 'browse' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Browse All Jobs</h2>
            {loading ? (
              <p>Loading jobs...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} onUpdate={loadData} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">My Applications</h2>
            {loading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p className="text-gray-600">You haven't applied to any jobs yet.</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app._id}
                    className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-800">
                          {app.jobId?.title}
                        </h3>
                        <p className="text-gray-600">{app.jobId?.company}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Applied: {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                            app.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : app.status === 'rejected'
                              ? 'bg-red-100 text-red-800'
                              : app.status === 'shortlisted'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {app.status}
                        </span>
                        {app.matchScore && (
                          <p className="text-sm text-gray-600 mt-2">
                            Match: {app.matchScore}%
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">My Profile</h2>
            <ProfileForm />
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateDashboard;