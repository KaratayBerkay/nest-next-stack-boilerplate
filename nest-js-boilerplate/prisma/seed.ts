import { PrismaClient } from '@prisma/client';

const CHAT_ROOMS = ['general', 'random', 'tech', 'design', 'music'] as const;

async function seed() {
  const prisma = new PrismaClient();
  try {
    for (const slug of CHAT_ROOMS) {
      await prisma.room.upsert({
        where: { slug },
        update: {},
        create: { slug },
      });
      console.log(`✓ room "${slug}" ready`);
    }
    console.log(`\nSeeded ${CHAT_ROOMS.length} rooms.`);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
