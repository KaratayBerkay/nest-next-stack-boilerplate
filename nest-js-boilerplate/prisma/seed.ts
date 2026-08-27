import { PrismaClient } from '@prisma/client';

const CHAT_ROOMS = ['general', 'random', 'tech', 'design', 'music'] as const;
// Kept in sync with MessagingRoomService.VIP_ROOMS (src/messaging/messaging-room.service.ts).
const VIP_ROOMS = ['vip-lounge'] as const;
const ALL_ROOMS = [...CHAT_ROOMS, ...VIP_ROOMS];

async function seed() {
  const prisma = new PrismaClient();
  try {
    for (const slug of ALL_ROOMS) {
      await prisma.room.upsert({
        where: { slug },
        update: {},
        create: { slug },
      });
      console.log(`✓ room "${slug}" ready`);
    }
    console.log(`\nSeeded ${ALL_ROOMS.length} rooms.`);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
