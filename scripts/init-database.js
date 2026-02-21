const { execSync } = require('child_process');
const path = require('path');

// Connection string from Neon
const DATABASE_URL = 'postgresql://neondb_owner:npg_7LwdDAWO4gTZ@ep-empty-surf-ai9el2fh-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

console.log('[v0] Starting database initialization...');

try {
  // Set environment variable
  process.env.DATABASE_URL = DATABASE_URL;
  
  console.log('[v0] Running Prisma generate...');
  execSync('npx prisma generate', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });
  
  console.log('[v0] Running Prisma migrate deploy...');
  execSync('npx prisma migrate deploy', { 
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL }
  });
  
  console.log('[v0] Database initialization completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('[v0] Error during database initialization:', error.message);
  process.exit(1);
}
