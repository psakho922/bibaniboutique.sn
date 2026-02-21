import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create users
  const password = await bcrypt.hash('password123', 10);
  
  const seller = await prisma.user.upsert({
    where: { email: 'vendeur@vinted.sn' },
    update: {},
    create: {
      email: 'vendeur@vinted.sn',
      password,
      role: 'SELLER',
      phone: '+221770000001',
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'acheteur@vinted.sn' },
    update: {},
    create: {
      email: 'acheteur@vinted.sn',
      password,
      role: 'USER',
      phone: '+221770000002',
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@vinted.sn' },
    update: {},
    create: {
      email: 'admin@vinted.sn',
      password,
      role: 'ADMIN',
      phone: '+221770000000',
    },
  });

  // Create listings
  await prisma.listing.create({
    data: {
      title: 'Robe d\'été fleurie',
      description: 'Magnifique robe légère, portée une seule fois. Idéale pour la saison chaude.',
      priceCfa: 5000,
      sellerId: seller.id,
      images: [],
      size: 'M',
      brand: 'Zara',
      condition: 'Comme neuf',
    },
  });

  await prisma.listing.create({
    data: {
      title: 'Jean Levi\'s 501',
      description: 'Jean vintage authentique, légère usure naturelle.',
      priceCfa: 15000,
      sellerId: seller.id,
      images: [],
      size: '32',
      brand: 'Levi\'s',
      condition: 'Bon état',
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
