// src/components/RecommendationList.jsx
import { useNavigate } from 'react-router-dom';
import { recommendationsAPI } from '../services/api';

const RecommendationList = ({ recommendations, onUpdate }) => {
  const navigate = useNavigate();

  const handleViewJob = async (recommendation) => {
    try {
      // Mark as viewed
      await recommendationsAPI.markAsViewed(recommendation._id);
      navigate(`/jobs/${recommendation.jobId._id}`);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error marking as viewed:', error);
      navigate(`/jobs/${recommendation.jobId._id}`);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const getMatchBadge = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <div
          key={rec._id}
          className={`bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition cursor-pointer ${
            rec.viewed ? 'opacity-75' : ''
          }`}
          onClick={() => handleViewJob(rec)}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {rec.jobId?.title}
              </h3>
              <p className="text-gray-600 mb-2">{rec.jobId?.company}</p>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📍 {rec.jobId?.location}</p>
                <p>💼 {rec.jobId?.jobType} • {rec.jobId?.experienceLevel}</p>
              </div>
            </div>
            <div className="text-right ml-4">
              <div className={`text-4xl font-bold ${getMatchColor(rec.matchScore)} mb-2`}>
                {rec.matchScore}%
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchBadge(rec.matchScore)}`}>
                {rec.matchScore >= 80 ? 'Excellent Match' : rec.matchScore >= 60 ? 'Good Match' : 'Fair Match'}
              </span>
            </div>
          </div>

          {rec.matchDetails && (
            <div className="bg-gray-50 rounded p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Match Details:</p>
              
              {rec.matchDetails.skillsMatch && (
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Skills Match:</span>{' '}
                    {rec.matchDetails.skillsMatch.percentage?.toFixed(0)}%
                  </p>
                  {rec.matchDetails.skillsMatch.matched?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.matchDetails.skillsMatch.matched.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs"
                        >
                          ✓ {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  {rec.matchDetails.skillsMatch.missing?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {rec.matchDetails.skillsMatch.missing.slice(0, 3).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-red-100 text-red-800 rounded text-xs"
                        >
                          ✗ {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {rec.matchDetails.experienceMatch && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Experience:</span>{' '}
                  {rec.matchDetails.experienceMatch.reason}
                </p>
              )}
            </div>
          )}

          {rec.reasoning && (
            <p className="text-sm text-gray-700 italic mb-4">"{rec.reasoning}"</p>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-xs text-gray-500">
              {rec.viewed ? '✓ Viewed' : 'New recommendation'}
            </span>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View Details →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecommendationList;