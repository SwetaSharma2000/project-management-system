require('dotenv').config();

const pool = require('./src/db/pool');

const projects = [
  { name: 'Website Redesign', description: 'Redesign the company website from scratch' },
  { name: 'Mobile App MVP', description: 'Build the first version of our mobile application' },
  { name: 'API Integration', description: 'Integrate third-party payment and auth APIs' },
  { name: 'Dashboard Analytics', description: 'Build internal analytics dashboard for the team' },
  { name: 'User Onboarding Flow', description: 'Redesign the onboarding experience for new users' },
  { name: 'Database Migration', description: 'Migrate from MySQL to PostgreSQL' },
  { name: 'SEO Optimization', description: 'Improve search rankings and page speed scores' },
  { name: 'Email Campaign System', description: 'Build automated email campaign management' },
  { name: 'Admin Panel', description: 'Internal admin panel for managing users and content' },
  { name: 'Performance Audit', description: 'Audit and fix all performance bottlenecks' },
  { name: 'Dark Mode Support', description: 'Add dark mode across the entire platform' },
  { name: 'CI/CD Pipeline', description: 'Set up automated testing and deployment pipeline' },
];

const taskTemplates = [
  { title: 'Initial planning & research', status: 'done', priority: 'high', days: -10 },
  { title: 'Design wireframes', status: 'done', priority: 'high', days: -5 },
  { title: 'Set up project structure', status: 'done', priority: 'medium', days: -3 },
  { title: 'Build core features', status: 'in-progress', priority: 'high', days: 3 },
  { title: 'Write unit tests', status: 'in-progress', priority: 'medium', days: 5 },
  { title: 'Code review & QA', status: 'todo', priority: 'medium', days: 8 },
  { title: 'Deploy to staging', status: 'todo', priority: 'low', days: 12 },
];

const getDate = (daysFromNow) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const seed = async () => {
  try {
    console.log('🌱 Seeding database...');

    // CREATE TABLES
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'todo',
        priority VARCHAR(10) DEFAULT 'medium',
        due_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // CLEAR OLD DATA
    await pool.query('TRUNCATE TABLE tasks, projects RESTART IDENTITY CASCADE');

    // INSERT DATA
    for (const project of projects) {
      const res = await pool.query(
        'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING id',
        [project.name, project.description]
      );
      const projectId = res.rows[0].id;

      for (const task of taskTemplates) {
        await pool.query(
          'INSERT INTO tasks (project_id, title, status, priority, due_date) VALUES ($1, $2, $3, $4, $5)',
          [projectId, task.title, task.status, task.priority, getDate(task.days)]
        );
      }
    }

    console.log(`✅ Seeded ${projects.length} projects with ${taskTemplates.length} tasks each`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seed();