const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Database connection string
const DATABASE_URL = 'postgresql://neondb_owner:npg_7LwdDAWO4gTZ@ep-empty-surf-ai9el2fh-pooler.c-4.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require';

// Create .env.local file if it doesn't exist
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  fs.writeFileSync(envPath, `DATABASE_URL="${DATABASE_URL}\n`);
  console.log('[v0] Created .env.local file');
} else {
  console.log('[v0] .env.local already exists');
}

// Set environment variable for this process
process.env.DATABASE_URL = DATABASE_URL;

try {
  console.log('[v0] Running prisma generate...');
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('[v0] Prisma generate completed');
  
  console.log('[v0] Running prisma db push...');
  execSync('npx prisma db push --skip-generate', { stdio: 'inherit' });
  console.log('[v0] Database schema created successfully');
} catch (error) {
  console.error('[v0] Error during database setup:', error.message);
  process.exit(1);
}
