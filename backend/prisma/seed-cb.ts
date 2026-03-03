import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.shipCompliance.upsert({
    where: { id: 1 },
    update: { cb_gco2eq: 50000 },
    create: { ship_id: 'S001', year: 2024, cb_gco2eq: 50000 },
  });
  console.log('CB seeded');
}

main().then(() => prisma.$disconnect());
