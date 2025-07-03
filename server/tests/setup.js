const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Setup test database
beforeAll(async () => {
  // Database is already migrated, just connect
  await prisma.$connect();
}, 10000);

afterAll(async () => {
  await prisma.$disconnect();
});
