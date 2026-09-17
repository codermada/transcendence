import 'dotenv/config';

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { auth } from '../auth/auth.js';
import { generateUsername } from '../lib/generateUsername.js';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  const email = process.env.INITIAL_ADMIN_EMAIL;
  const password = process.env.INITIAL_ADMIN_PASSWORD;

  if (!email) {
    throw new Error('INITIAL_ADMIN_EMAIL is not defined.');
  }

  if (!password) {
    throw new Error('INITIAL_ADMIN_PASSWORD is not defined.');
  }

  if (password.length < 8) {
    throw new Error(
      'INITIAL_ADMIN_PASSWORD must be at least 8 characters.',
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        role: 'admin',
        emailVerified: true,
      },
    });

    console.log(`✅ ${email} is already an admin.`);
    return;
  }

  console.log(`Creating initial admin: ${email}`);

  const result = await auth.api.signUpEmail({
    body: {
      email,
      password,
      name: 'Administrator',
    },
  });

  if (!result?.user) {
    throw new Error('Failed to create initial admin.');
  }

  await prisma.user.update({
    where: {
      id: result.user.id,
    },
    data: {
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log(`✅ Initial admin created: ${email}`);
}

main()
  .catch((error) => {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });