// src/pages/RecruiterDashboard.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';
import JobCard from '../components/JobCard';

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'jobs') {
        const res = await jobsAPI.getMyJobs();
        setJobs(res.data);
      } else if (activeTab === 'applications') {
        const res = await applicationsAPI.getJobApplications();
        setApplications(res.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const jobData = {
      title: formData.get('title'),
      description: formData.get('description'),
      company: user.companyName,
      location: formData.get('location'),
      jobType: formData.get('jobType'),
      experienceLevel: formData.get('experienceLevel'),
      requiredSkills: [],
    };

    try {
      await jobsAPI.createJob(jobData);
      alert('Job posted successfully!');
      setShowCreateForm(false);
      loadData();
    } catch (error) {
      alert('Failed to create job');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          {user?.companyName} Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Manage your job postings and applications</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {['jobs', 'applications', 'stats'].map((tab) => (
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
        {activeTab === 'jobs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">My Job Postings</h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {showCreateForm ? 'Cancel' : '+ Post New Job'}
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white border rounded-lg p-6 mb-6 shadow-sm">
                <h3 className="text-xl font-semibold mb-4">Create New Job</h3>
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Job Title</label>
                    <input
                      name="title"
                      required
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Senior Full Stack Developer"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      name="description"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Job description..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Location</label>
                      <input
                        name="location"
                        required
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="New York, NY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Job Type</label>
                      <select
                        name="jobType"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Experience Level</label>
                      <select
                        name="experienceLevel"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="entry">Entry</option>
                        <option value="mid">Mid</option>
                        <option value="senior">Senior</option>
                        <option value="lead">Lead</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                  >
                    Post Job
                  </button>
                </form>
              </div>
            )}

            {loading ? (
              <p>Loading jobs...</p>
            ) : jobs.length === 0 ? (
              <p className="text-gray-600">No jobs posted yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job._id} job={job} isRecruiter={true} onUpdate={loadData} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Applications</h2>
            {loading ? (
              <p>Loading applications...</p>
            ) : applications.length === 0 ? (
              <p className="text-gray-600">No applications received yet.</p>
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
                          {app.candidateId?.fullName}
                        </h3>
                        <p className="text-gray-600">{app.candidateId?.email}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          Applied for: {app.jobId?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600 mb-2">
                          {app.matchScore}%
                        </div>
                        <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                          {app.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 text-sm">Total Jobs</p>
                <p className="text-3xl font-bold text-blue-600">{jobs.length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 text-sm">Applications</p>
                <p className="text-3xl font-bold text-green-600">{applications.length}</p>
              </div>
              <div className="bg-white border rounded-lg p-6 shadow-sm">
                <p className="text-gray-600 text-sm">Active Jobs</p>
                <p className="text-3xl font-bold text-purple-600">
                  {jobs.filter((j) => j.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;