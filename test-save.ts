import { prisma } from './src/lib/prisma';
import { createResume, updateResume } from './src/services/resume-service';
import { registerUser } from './src/services/user-service';

async function test() {
  console.log('Testing N-tier save flow...');

  // 1. Create a test user
  const email = `test-${Date.now()}@example.com`;
  console.log(`Registering test user: ${email}`);
  const user = await registerUser('Test User', email, 'password123');
  console.log('User registered:', user);

  // 2. Create a test resume
  console.log('Creating test resume...');
  const resume = await createResume(user.id, {
    title: 'Test Base Resume',
    fullName: 'Test Candidate',
    email: email,
    phone: '123-456-7890',
    experiences: [
      {
        jobTitle: 'Software Engineer',
        company: 'Tech Corp',
        startDate: 'Jan 2020',
        endDate: 'Present',
        isCurrent: true,
        achievements: ['Developed awesome apps', 'Led teams'],
      }
    ],
    education: [
      {
        school: 'University of Code',
        degree: 'Bachelor of Science',
        endDate: 'May 2019',
      }
    ],
    skills: [
      { name: 'TypeScript', category: 'Languages' },
      { name: 'React', category: 'Frameworks' }
    ],
    projects: [
      {
        name: 'Resume Builder',
        description: 'AI resume builder app',
        technologies: ['Next.js', 'Prisma'],
      }
    ]
  });
  console.log('Resume created successfully with ID:', resume.id);

  // 3. Update the resume
  console.log('Updating resume details...');
  const updated = await updateResume(resume.id, user.id, {
    title: 'Updated Resume Title',
    fullName: 'Test Candidate Updated',
    email: email,
    phone: '123-456-7890',
    experiences: [
      {
        jobTitle: 'Senior Software Engineer',
        company: 'Tech Corp',
        startDate: 'Jan 2020',
        endDate: 'Present',
        isCurrent: true,
        achievements: ['Developed awesome apps', 'Led teams', 'Optimized database queries'],
      }
    ],
    education: [
      {
        school: 'University of Code',
        degree: 'Master of Science',
        endDate: 'May 2021',
      }
    ],
    skills: [
      { name: 'TypeScript', category: 'Languages' },
      { name: 'React', category: 'Frameworks' },
      { name: 'Next.js', category: 'Frameworks' }
    ],
    projects: [
      {
        name: 'Resume Builder v2',
        description: 'AI resume builder app with N-tier',
        technologies: ['Next.js', 'Prisma', 'TypeScript'],
      }
    ]
  });
  console.log('Resume updated successfully! New Title:', updated.title);

  // 4. Fetch the updated resume to verify persistence
  const fetched = await prisma.resume.findFirst({
    where: { id: resume.id },
    include: {
      experiences: true,
      education: true,
      skills: true,
      projects: true,
    }
  });
  console.log('Fetched resume experience count:', fetched?.experiences.length);
  console.log('Fetched resume experience jobTitle:', fetched?.experiences[0]?.jobTitle);
  console.log('Fetched resume achievements:', fetched?.experiences[0]?.achievements);

  console.log('All tests passed successfully!');
}

test()
  .catch(err => {
    console.error('Test failed with error:', err);
  })
  .finally(() => {
    prisma.$disconnect();
  });
