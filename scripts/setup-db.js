const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

console.log('[v0] Starting database setup...');
console.log('[v0] Project root:', projectRoot);

// Run Prisma generate first
const generate = spawn('npx', ['prisma', 'generate'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

generate.on('close', (code) => {
  if (code === 0) {
    console.log('[v0] Prisma client generated successfully!');
    
    // Now run prisma db push
    const push = spawn('npx', ['prisma', 'db', 'push', '--skip-generate'], {
      cwd: projectRoot,
      stdio: 'inherit',
      shell: true,
    });

    push.on('close', (pushCode) => {
      if (pushCode === 0) {
        console.log('[v0] Database schema created successfully!');
        process.exit(0);
      } else {
        console.error('[v0] Database setup failed with code:', pushCode);
        process.exit(1);
      }
    });

    push.on('error', (err) => {
      console.error('[v0] Error running db push:', err);
      process.exit(1);
    });
  } else {
    console.error('[v0] Prisma generate failed with code:', code);
    process.exit(1);
  }
});

generate.on('error', (err) => {
  console.error('[v0] Error running Prisma generate:', err);
  process.exit(1);
});
