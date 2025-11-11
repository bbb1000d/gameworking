import { PrismaClient } from "@prisma/client";
import { skillTree, bosses } from "@rogue/shared";

const prisma = new PrismaClient();

async function main() {
  for (const boss of bosses) {
    await prisma.boss.upsert({
      where: { key: boss.key },
      update: { name: boss.name, unlockKey: boss.unlockKey },
      create: { key: boss.key, name: boss.name, unlockKey: boss.unlockKey },
    });
  }

  for (const node of skillTree) {
    await prisma.skillNode.upsert({
      where: { key: node.key },
      update: {
        path: node.path,
        maxRank: node.maxRank,
        description: node.description,
        requiresJson: node.requires,
        synergiesJson: node.synergies ?? [],
      },
      create: {
        key: node.key,
        path: node.path,
        maxRank: node.maxRank,
        description: node.description,
        requiresJson: node.requires,
        synergiesJson: node.synergies ?? [],
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
