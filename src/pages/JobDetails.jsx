// src/pages/JobDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { jobsAPI, applicationsAPI } from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const res = await jobsAPI.getJobById(id);
      setJob(res.data);
    } catch (error) {
      console.error('Error loading job:', error);
      alert('Job not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    
    const formData = new FormData(e.target);
    const applicationData = {
      coverLetter: formData.get('coverLetter'),
    };

    try {
      await applicationsAPI.applyToJob(id, applicationData);
      alert('Application submitted successfully!');
      setShowApplyForm(false);
      navigate('/candidate/dashboard');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading job details...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Job not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="text-blue-600 hover:text-blue-800 mb-6 flex items-center"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="border-b pb-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{job.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{job.company}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>📍 {job.location}</span>
            <span>💼 {job.jobType}</span>
            <span>⭐ {job.experienceLevel}</span>
            {job.salaryRange && (
              <span>
                💰 ${job.salaryRange.min.toLocaleString()} - $
                {job.salaryRange.max.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">{job.description}</p>
          </div>

          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill._id}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {job.qualifications && job.qualifications.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Qualifications</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx}>{qual}</li>
                ))}
              </ul>
            </div>
          )}

          {job.benefits && job.benefits.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-3">Benefits</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.benefits.map((benefit, idx) => (
                  <li key={idx}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500 mb-4">
              Posted: {new Date(job.postedAt).toLocaleDateString()}
            </p>

            {user && user.role === 'candidate' && (
              <div>
                {!showApplyForm ? (
                  <button
                    onClick={() => setShowApplyForm(true)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                  >
                    Apply Now
                  </button>
                ) : (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Apply for this position</h3>
                    <form onSubmit={handleApply} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Cover Letter (Optional)
                        </label>
                        <textarea
                          name="coverLetter"
                          rows={6}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Tell us why you're a great fit for this role..."
                        />
                      </div>
                      <div className="flex gap-4">
                        <button
                          type="submit"
                          disabled={applying}
                          className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                          {applying ? 'Submitting...' : 'Submit Application'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowApplyForm(false)}
                          className="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
              >
                Login to Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;