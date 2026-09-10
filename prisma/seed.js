const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@skillbridge.app' },
    update: {},
    create: { name: 'Admin', email: 'admin@skillbridge.app', password, isAdmin: true, college: 'Platform Staff' },
  });

  const devraj = await prisma.user.upsert({
    where: { email: 'devraj@college.edu' },
    update: {},
    create: { name: 'Devraj Singh', email: 'devraj@college.edu', password, college: 'Blue Ridge College' },
  });

  const meera = await prisma.user.upsert({
    where: { email: 'meera@college.edu' },
    update: {},
    create: { name: 'Meera Nair', email: 'meera@college.edu', password, college: 'Blue Ridge College' },
  });

  const arjun = await prisma.user.upsert({
    where: { email: 'arjun@college.edu' },
    update: {},
    create: { name: 'Arjun Mehta', email: 'arjun@college.edu', password, college: 'Blue Ridge College' },
  });

  const ananya = await prisma.user.upsert({
    where: { email: 'ananya@college.edu' },
    update: {},
    create: { name: 'Ananya Rao', email: 'ananya@college.edu', password, college: 'Blue Ridge College' },
  });

  // Writing service with package tiers
  await prisma.listing.create({
    data: {
      sellerId: devraj.id,
      title: 'Line editing & proofreading for essays',
      category: 'Writing & Editing',
      description: 'Careful sentence-level editing for clarity, grammar, and flow. I annotate every change so you learn from it, not just receive a cleaned file.',
      guidelines: 'I edit and suggest — I never write original content or submit work on your behalf.',
      pricingType: 'PACKAGES',
      packages: {
        create: [
          { name: 'Basic', price: 450, detail: 'Up to 1,500 words, grammar & clarity pass', deliveryDays: 2 },
          { name: 'Standard', price: 900, detail: 'Up to 3,500 words, structural notes included', deliveryDays: 2 },
          { name: 'Premium', price: 1500, detail: 'Up to 6,000 words, line notes + call', deliveryDays: 3 },
        ],
      },
    },
  });

  // Tutoring service, hourly pricing
  await prisma.listing.create({
    data: {
      sellerId: meera.id,
      title: 'Math & aptitude tutoring, 1-on-1',
      category: 'Tutoring',
      description: 'I focus on building intuition before speed — most students I work with come in worried about a specific exam and leave able to teach the topic back to me.',
      guidelines: 'Online sessions over a meeting link of your choice.',
      pricingType: 'HOURLY',
      basePrice: 350,
      unitLabel: 'hour',
    },
  });

  // Photography service, per-photo pricing (the example the founder asked for)
  await prisma.listing.create({
    data: {
      sellerId: arjun.id,
      title: 'DSLR event & portrait photography',
      category: 'Photography',
      description: "Got a fest, a shoot, or just want good photos for your portfolio? I bring my own DSLR and lenses — no need to own a camera. Pay only for the shots you keep.",
      guidelines: 'Book ahead for events. I deliver edited high-res photos within 3 days.',
      pricingType: 'UNIT',
      basePrice: 10,
      unitLabel: 'photo',
    },
  });

  // Flat-rate example — another open category
  await prisma.listing.create({
    data: {
      sellerId: ananya.id,
      title: 'Laptop & phone screen repair',
      category: 'Repairs',
      description: 'Cracked screen, slow laptop, battery issues — I fix common hardware and software problems on campus, same day where possible.',
      guidelines: 'Diagnosis is free. I quote a flat price before starting any repair.',
      pricingType: 'FLAT',
      basePrice: 500,
    },
  });

  console.log('Seed complete. Sample login: admin@skillbridge.app / password123 (or devraj@ / meera@ / arjun@ / ananya@college.edu, same password).');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
