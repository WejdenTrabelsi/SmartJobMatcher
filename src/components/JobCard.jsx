// src/components/JobCard.jsx
import { useNavigate } from 'react-router-dom';

const JobCard = ({ job, isRecruiter, onUpdate }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/jobs/${job._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">{job.title}</h3>
        <p className="text-gray-600">{job.company}</p>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <p>📍 {job.location}</p>
        <p>💼 {job.jobType} • {job.experienceLevel}</p>
        {job.salaryRange && (
          <p>
            💰 ${job.salaryRange.min.toLocaleString()} - $
            {job.salaryRange.max.toLocaleString()}
          </p>
        )}
      </div>

      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.slice(0, 3).map((skill) => (
              <span
                key={skill._id || skill}
                className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
              >
                {skill.name || skill}
              </span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                +{job.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-4 border-t">
        <span className="text-xs text-gray-500">
          Posted {new Date(job.postedAt).toLocaleDateString()}
        </span>
        {isRecruiter && (
          <span className="text-xs text-gray-600">
            {job.applicationsCount || 0} applications
          </span>
        )}
      </div>
    </div>
  );
};

export default JobCard;