// backend/scripts/seedDatabase.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Job = require('../models/Job');
const Skill = require('../models/Skill');
const Application = require('../models/Application');
const Recommendation = require('../models/Recommendation');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

// Sample Skills Data
const skillsData = [
  { name: 'react', category: 'framework', synonyms: ['reactjs', 'react.js'] },
  { name: 'node.js', category: 'programming', synonyms: ['nodejs', 'node'] },
  { name: 'javascript', category: 'programming', synonyms: ['js', 'ecmascript'] },
  { name: 'typescript', category: 'programming', synonyms: ['ts'] },
  { name: 'mongodb', category: 'database', synonyms: ['mongo'] },
  { name: 'postgresql', category: 'database', synonyms: ['postgres', 'psql'] },
  { name: 'python', category: 'programming', synonyms: [] },
  { name: 'django', category: 'framework', synonyms: [] },
  { name: 'express', category: 'framework', synonyms: ['express.js', 'expressjs'] },
  { name: 'vue', category: 'framework', synonyms: ['vue.js', 'vuejs'] },
  { name: 'angular', category: 'framework', synonyms: ['angularjs'] },
  { name: 'docker', category: 'devops', synonyms: [] },
  { name: 'kubernetes', category: 'devops', synonyms: ['k8s'] },
  { name: 'aws', category: 'cloud', synonyms: ['amazon web services'] },
  { name: 'azure', category: 'cloud', synonyms: ['microsoft azure'] },
  { name: 'git', category: 'tool', synonyms: ['github', 'gitlab'] },
  { name: 'rest api', category: 'other', synonyms: ['restful', 'rest'] },
  { name: 'graphql', category: 'other', synonyms: [] },
  { name: 'sql', category: 'database', synonyms: [] },
  { name: 'html', category: 'programming', synonyms: ['html5'] },
  { name: 'css', category: 'design', synonyms: ['css3'] },
  { name: 'tailwind', category: 'framework', synonyms: ['tailwindcss'] },
  { name: 'figma', category: 'design', synonyms: [] },
  { name: 'communication', category: 'soft-skill', synonyms: [] },
  { name: 'teamwork', category: 'soft-skill', synonyms: ['collaboration'] },
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Job.deleteMany({});
    await Skill.deleteMany({});
    await Application.deleteMany({});
    await Recommendation.deleteMany({});
    console.log('✅ Database cleared');

    // 1. Create Skills
    console.log('📚 Creating skills...');
    const skills = await Skill.insertMany(skillsData);
    console.log(`✅ Created ${skills.length} skills`);

    // Helper to get skill IDs by names
    const getSkillIds = (names) => {
      return skills.filter(s => names.includes(s.name)).map(s => s._id);
    };

    // 2. Create Users (Candidates)
    console.log('👤 Creating candidates...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const candidates = await User.insertMany([
      {
        email: 'john.doe@example.com',
        password: hashedPassword,
        role: 'candidate',
        fullName: 'John Doe',
        phone: '+1234567890',
        location: 'New York, NY',
        bio: 'Experienced full-stack developer with 5 years in React and Node.js. Passionate about building scalable web applications.',
        resumeUrl: 'https://example.com/resumes/john-doe.pdf',
        skills: getSkillIds(['react', 'node.js', 'javascript', 'mongodb', 'express', 'docker']),
        experience: [
          {
            title: 'Senior Software Engineer',
            company: 'Tech Corp',
            duration: '2020 - Present',
            description: 'Led development of microservices architecture using Node.js and React'
          },
          {
            title: 'Software Engineer',
            company: 'StartupXYZ',
            duration: '2018 - 2020',
            description: 'Built REST APIs and React applications'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Science',
            institution: 'MIT',
            year: '2018'
          }
        ]
      },
      {
        email: 'jane.smith@example.com',
        password: hashedPassword,
        role: 'candidate',
        fullName: 'Jane Smith',
        phone: '+1987654321',
        location: 'San Francisco, CA',
        bio: 'Frontend specialist with expertise in React, Vue, and modern CSS frameworks.',
        resumeUrl: 'https://example.com/resumes/jane-smith.pdf',
        skills: getSkillIds(['react', 'vue', 'javascript', 'typescript', 'tailwind', 'figma']),
        experience: [
          {
            title: 'Frontend Developer',
            company: 'Design Co',
            duration: '2019 - Present',
            description: 'Created responsive web applications with React and Vue'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Design',
            institution: 'Stanford University',
            year: '2019'
          }
        ]
      },
      {
        email: 'alex.johnson@example.com',
        password: hashedPassword,
        role: 'candidate',
        fullName: 'Alex Johnson',
        phone: '+1122334455',
        location: 'Austin, TX',
        bio: 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines.',
        resumeUrl: 'https://example.com/resumes/alex-johnson.pdf',
        skills: getSkillIds(['docker', 'kubernetes', 'aws', 'python', 'git']),
        experience: [
          {
            title: 'DevOps Engineer',
            company: 'Cloud Systems Inc',
            duration: '2020 - Present',
            description: 'Managed AWS infrastructure and implemented CI/CD pipelines'
          }
        ],
        education: [
          {
            degree: 'Bachelor of Computer Engineering',
            institution: 'UT Austin',
            year: '2020'
          }
        ]
      }
    ]);
    console.log(`✅ Created ${candidates.length} candidates`);

    // 3. Create Users (Recruiters)
    console.log('🏢 Creating recruiters...');
    const recruiters = await User.insertMany([
      {
        email: 'recruiter@techcorp.com',
        password: hashedPassword,
        role: 'recruiter',
        companyName: 'Tech Corp',
        companyWebsite: 'https://techcorp.com',
        companyDescription: 'Leading technology company specializing in AI and cloud solutions'
      },
      {
        email: 'hr@innovatesoft.com',
        password: hashedPassword,
        role: 'recruiter',
        companyName: 'InnovateSoft',
        companyWebsite: 'https://innovatesoft.com',
        companyDescription: 'Innovative software company building next-gen applications'
      }
    ]);
    console.log(`✅ Created ${recruiters.length} recruiters`);

    // 4. Create Jobs
    console.log('💼 Creating jobs...');
    const jobs = await Job.insertMany([
      {
        title: 'Senior Full Stack Developer',
        description: 'We are looking for an experienced full-stack developer to join our growing team. You will work on cutting-edge projects using React, Node.js, and MongoDB.',
        company: 'Tech Corp',
        location: 'New York, NY',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salaryRange: { min: 120000, max: 180000, currency: 'USD' },
        requiredSkills: getSkillIds(['react', 'node.js', 'mongodb', 'javascript']),
        responsibilities: [
          'Design and develop scalable web applications',
          'Collaborate with cross-functional teams',
          'Write clean, maintainable code',
          'Mentor junior developers'
        ],
        qualifications: [
          '5+ years of full-stack development experience',
          'Strong knowledge of React and Node.js',
          'Experience with MongoDB or similar NoSQL databases',
          'Excellent problem-solving skills'
        ],
        benefits: [
          'Health insurance',
          '401(k) matching',
          'Remote work options',
          'Professional development budget'
        ],
        recruiterId: recruiters[0]._id,
        status: 'active',
        postedAt: new Date('2024-10-15')
      },
      {
        title: 'Frontend React Developer',
        description: 'Join our design-focused team to create beautiful, responsive web applications using React and modern CSS frameworks.',
        company: 'InnovateSoft',
        location: 'San Francisco, CA',
        jobType: 'full-time',
        experienceLevel: 'mid',
        salaryRange: { min: 90000, max: 130000, currency: 'USD' },
        requiredSkills: getSkillIds(['react', 'javascript', 'css', 'html']),
        responsibilities: [
          'Develop user-facing features using React',
          'Optimize applications for maximum speed',
          'Collaborate with designers',
          'Ensure technical feasibility of UI/UX designs'
        ],
        qualifications: [
          '3+ years React development experience',
          'Strong CSS and HTML skills',
          'Experience with responsive design',
          'Portfolio of work required'
        ],
        benefits: [
          'Competitive salary',
          'Flexible hours',
          'Modern office space',
          'Team events'
        ],
        recruiterId: recruiters[1]._id,
        status: 'active',
        postedAt: new Date('2024-10-20')
      },
      {
        title: 'DevOps Engineer',
        description: 'We need a DevOps expert to manage our cloud infrastructure and streamline our deployment processes.',
        company: 'Tech Corp',
        location: 'Remote',
        jobType: 'full-time',
        experienceLevel: 'senior',
        salaryRange: { min: 110000, max: 160000, currency: 'USD' },
        requiredSkills: getSkillIds(['docker', 'kubernetes', 'aws', 'python']),
        responsibilities: [
          'Manage AWS cloud infrastructure',
          'Implement CI/CD pipelines',
          'Monitor system performance',
          'Automate deployment processes'
        ],
        qualifications: [
          '4+ years DevOps experience',
          'Strong knowledge of Docker and Kubernetes',
          'AWS certification preferred',
          'Scripting skills in Python or Bash'
        ],
        benefits: [
          'Remote work',
          'Health insurance',
          'Stock options',
          'Learning budget'
        ],
        recruiterId: recruiters[0]._id,
        status: 'active',
        postedAt: new Date('2024-10-25')
      },
      {
        title: 'Junior Full Stack Developer',
        description: 'Great opportunity for a junior developer to learn and grow in a supportive environment.',
        company: 'InnovateSoft',
        location: 'Austin, TX',
        jobType: 'full-time',
        experienceLevel: 'entry',
        salaryRange: { min: 60000, max: 80000, currency: 'USD' },
        requiredSkills: getSkillIds(['javascript', 'react', 'node.js']),
        responsibilities: [
          'Assist in developing web applications',
          'Write and maintain code',
          'Learn from senior developers',
          'Participate in code reviews'
        ],
        qualifications: [
          '0-2 years experience',
          'Knowledge of JavaScript',
          'Familiarity with React',
          'Eager to learn'
        ],
        benefits: [
          'Mentorship program',
          'Health insurance',
          'Flexible schedule',
          'Career growth'
        ],
        recruiterId: recruiters[1]._id,
        status: 'active',
        postedAt: new Date('2024-10-28')
      },
      {
        title: 'Python Backend Developer',
        description: 'Looking for a Python developer to build robust backend systems and APIs.',
        company: 'Tech Corp',
        location: 'New York, NY',
        jobType: 'full-time',
        experienceLevel: 'mid',
        salaryRange: { min: 100000, max: 140000, currency: 'USD' },
        requiredSkills: getSkillIds(['python', 'django', 'postgresql', 'rest api']),
        responsibilities: [
          'Develop backend APIs using Django',
          'Design database schemas',
          'Write unit tests',
          'Optimize application performance'
        ],
        qualifications: [
          '3+ years Python development',
          'Experience with Django or Flask',
          'Strong SQL knowledge',
          'API design experience'
        ],
        benefits: [
          'Competitive salary',
          'Health benefits',
          'Hybrid work',
          'Training opportunities'
        ],
        recruiterId: recruiters[0]._id,
        status: 'active',
        postedAt: new Date('2024-11-01')
      }
    ]);
    console.log(`✅ Created ${jobs.length} jobs`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Skills: ${skills.length}`);
    console.log(`   - Candidates: ${candidates.length}`);
    console.log(`   - Recruiters: ${recruiters.length}`);
    console.log(`   - Jobs: ${jobs.length}`);
    console.log('\n🔐 Login Credentials:');
    console.log('   Candidates:');
    console.log('     - john.doe@example.com / password123');
    console.log('     - jane.smith@example.com / password123');
    console.log('     - alex.johnson@example.com / password123');
    console.log('   Recruiters:');
    console.log('     - recruiter@techcorp.com / password123');
    console.log('     - hr@innovatesoft.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

// Run seed
seedDatabase();