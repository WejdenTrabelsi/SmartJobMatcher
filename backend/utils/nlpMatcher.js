// backend/utils/nlpMatcher.js
const natural = require('natural');
const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

/**
 * Calculate TF-IDF similarity between candidate profile and job description
 */
function calculateTfIdfSimilarity(candidateText, jobText) {
  const tfidf = new TfIdf();
  
  tfidf.addDocument(candidateText);
  tfidf.addDocument(jobText);
  
  const candidateTerms = tokenizer.tokenize(candidateText.toLowerCase());
  let similarity = 0;
  
  candidateTerms.forEach(term => {
    const candidateScore = tfidf.tfidf(term, 0);
    const jobScore = tfidf.tfidf(term, 1);
    similarity += Math.min(candidateScore, jobScore);
  });
  
  return Math.min(similarity * 10, 100); // Normalize to 0-100
}

/**
 * Calculate skill match percentage
 */
function calculateSkillMatch(candidateSkills, jobSkills) {
  if (jobSkills.length === 0) return { percentage: 0, matched: [], missing: [] };
  
  const candidateSkillNames = candidateSkills.map(s => s.name || s.toLowerCase());
  const jobSkillNames = jobSkills.map(s => s.name || s.toLowerCase());
  
  const matched = jobSkillNames.filter(skill => 
    candidateSkillNames.includes(skill)
  );
  
  const missing = jobSkillNames.filter(skill => 
    !candidateSkillNames.includes(skill)
  );
  
  const percentage = (matched.length / jobSkillNames.length) * 100;
  
  return { percentage, matched, missing };
}

/**
 * Calculate experience level match
 */
function calculateExperienceMatch(candidateYears, jobLevel) {
  const levelMap = {
    'entry': { min: 0, max: 2 },
    'mid': { min: 2, max: 5 },
    'senior': { min: 5, max: 10 },
    'lead': { min: 8, max: 100 }
  };
  
  const range = levelMap[jobLevel] || levelMap['mid'];
  
  if (candidateYears >= range.min && candidateYears <= range.max) {
    return { score: 100, reason: 'Perfect experience match' };
  } else if (candidateYears < range.min) {
    const diff = range.min - candidateYears;
    return { 
      score: Math.max(0, 100 - (diff * 20)), 
      reason: `${diff} years below requirement` 
    };
  } else {
    return { 
      score: 90, 
      reason: 'Over-qualified but suitable' 
    };
  }
}

/**
 * Main matching function
 */
async function generateJobMatch(candidate, job) {
  // Build candidate text profile
  const candidateText = [
    candidate.bio || '',
    candidate.skills?.map(s => s.name).join(' ') || '',
    candidate.experience?.map(e => `${e.title} ${e.description}`).join(' ') || ''
  ].join(' ');
  
  // Build job text profile
  const jobText = [
    job.title,
    job.description,
    job.requiredSkills?.map(s => s.name).join(' ') || '',
    job.responsibilities?.join(' ') || '',
    job.qualifications?.join(' ') || ''
  ].join(' ');
  
  // Calculate components
  const tfidfScore = calculateTfIdfSimilarity(candidateText, jobText);
  const skillsMatch = calculateSkillMatch(
    candidate.skills || [],
    job.requiredSkills || []
  );
  
  const candidateYears = candidate.experience?.length * 2 || 0; // Rough estimate
  const experienceMatch = calculateExperienceMatch(candidateYears, job.experienceLevel);
  
  // Location match (simple string comparison)
  const locationMatch = {
    score: candidate.location?.toLowerCase() === job.location?.toLowerCase() ? 100 : 50,
    reason: candidate.location === job.location ? 'Same location' : 'Different location'
  };
  
  // Weighted final score
  const finalScore = (
    skillsMatch.percentage * 0.4 +
    tfidfScore * 0.3 +
    experienceMatch.score * 0.2 +
    locationMatch.score * 0.1
  );
  
  return {
    matchScore: Math.round(finalScore),
    matchDetails: {
      skillsMatch,
      experienceMatch,
      locationMatch
    },
    reasoning: generateReasoning(skillsMatch, experienceMatch, locationMatch, finalScore)
  };
}

function generateReasoning(skillsMatch, experienceMatch, locationMatch, score) {
  let reasoning = [];
  
  if (score >= 80) {
    reasoning.push('Excellent match!');
  } else if (score >= 60) {
    reasoning.push('Good match.');
  } else {
    reasoning.push('Moderate match.');
  }
  
  reasoning.push(`${Math.round(skillsMatch.percentage)}% skills match.`);
  reasoning.push(experienceMatch.reason);
  reasoning.push(locationMatch.reason);
  
  return reasoning.join(' ');
}

module.exports = {
  generateJobMatch,
  calculateSkillMatch,
  calculateExperienceMatch
};