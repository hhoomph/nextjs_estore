import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { randomBytes, scrypt } from 'node:crypto';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const config = {
    N: 16384,
    r: 16,
    p: 1,
    dkLen: 64,
    maxmem: 128 * 16384 * 16 * 2,
  };

  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      config.dkLen,
      config,
      (err, key) => {
        if (err) reject(err);
        else resolve(salt + ':' + key.toString('hex'));
      },
    );
  });
}

async function createAdminUser() {
  console.log('Creating admin user...');

  const existing = await prisma.user.findUnique({
    where: { email: 'admin@example.com' },
    select: { id: true },
  });

  if (existing) {
    await prisma.session.deleteMany({ where: { userId: existing.id } });
    await prisma.account.deleteMany({ where: { userId: existing.id } });
    await prisma.user.delete({ where: { id: existing.id } });
    console.log('Deleted existing admin user');
  }

  const user = await prisma.user.create({
    data: {
      id: crypto.randomUUID(),
      email: 'admin@example.com',
      name: 'Admin User',
      role: 'ADMIN',
      active: true,
      emailVerified: true,
    },
  });

  console.log('User created:', user.id);

  const passwordHash = await hashPassword('admin123456');

  const account = await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      accountId: user.email,
      providerId: 'credential',
      issuer: 'local:credential',
      password: passwordHash,
    },
  });

  console.log('Account created:', account.id);
  console.log('Admin user created successfully!');
  console.log('Email: admin@example.com');
  console.log('Password: admin123456');
  console.log('Role: ADMIN');

  await prisma.$disconnect();
}

createAdminUser().catch((e) => {
  console.error('Error:', e);
  process.exit(1);
});
