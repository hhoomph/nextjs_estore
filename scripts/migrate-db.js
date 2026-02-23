import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

console.log('[v0] Starting Prisma migration...');
console.log('[v0] Project root:', projectRoot);

const migrate = spawn('npx', ['prisma', 'migrate', 'deploy'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

migrate.on('close', (code) => {
  if (code === 0) {
    console.log('[v0] Migration completed successfully!');
    process.exit(0);
  } else {
    console.error('[v0] Migration failed with code:', code);
    process.exit(1);
  }
});

migrate.on('error', (err) => {
  console.error('[v0] Error running migration:', err);
  process.exit(1);
});
