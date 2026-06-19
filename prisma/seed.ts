import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('bluesea2024', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@bluesea.ru' },
    update: {},
    create: {
      email: 'admin@bluesea.ru',
      password: hashedPassword,
    },
  });
  console.log('✓ Admin user created (admin@bluesea.ru / bluesea2024)');

  // Create cats
  const cat1 = await prisma.cat.create({
    data: {
      name: 'Гранд Лорд Арктур',
      title: 'Grand International Champion',
      gender: 'male',
      color: 'Сил тэбби пойнт',
      description: 'Великолепный кот с мощным костяком и роскошной шерстью. Обладатель множества наград на международных выставках.',
      photoUrl: '/images/cat-male-1.png',
      birthDate: '2021-03-15',
      sortOrder: 1,
    },
  });

  const cat2 = await prisma.cat.create({
    data: {
      name: 'Северный Шторм',
      title: 'Champion',
      gender: 'male',
      color: 'Сил пойнт',
      description: 'Мощный и харизматичный кот с глубокими голубыми глазами.',
      photoUrl: '/images/cat-male-2.png',
      birthDate: '2022-01-20',
      sortOrder: 2,
    },
  });

  const cat3 = await prisma.cat.create({
    data: {
      name: 'Бриллиант Нева',
      title: 'International Champion',
      gender: 'female',
      color: 'Блю тэбби пойнт',
      description: 'Элегантная кошка с безупречным типом и изысканным окрасом. Жемчужина нашего питомника.',
      photoUrl: '/images/cat-female-1.png',
      birthDate: '2021-08-10',
      sortOrder: 3,
    },
  });

  const cat4 = await prisma.cat.create({
    data: {
      name: 'Снежная Королева',
      title: 'Champion',
      gender: 'female',
      color: 'Крем пойнт',
      description: 'Нежная и грациозная кошка с редким кремовым окрасом.',
      photoUrl: '/images/cat-female-2.png',
      birthDate: '2022-05-03',
      sortOrder: 4,
    },
  });
  console.log('✓ 4 cats created');

  // Create litters with kittens
  const litter1 = await prisma.litter.create({
    data: {
      name: 'Помёт «А»',
      birthDate: '2025-11-10',
      description: 'Первый помёт Бриллиант Невы от Гранд Лорда Арктура. В помёте 3 котёнка — 2 девочки и 1 мальчик.',
      motherId: cat3.id,
      fatherId: cat1.id,
      sortOrder: 1,
    },
  });

  const litter2 = await prisma.litter.create({
    data: {
      name: 'Помёт «Б»',
      birthDate: '2026-01-25',
      description: 'Помёт Снежной Королевы от Северного Шторма. В помёте 4 котёнка — 1 девочка и 3 мальчика.',
      motherId: cat4.id,
      fatherId: cat2.id,
      sortOrder: 2,
    },
  });

  // Litter 1 kittens (litter A — older, some sold)
  await prisma.kitten.createMany({
    data: [
      {
        name: 'Аврора',
        gender: 'female',
        color: 'Блю тэбби пойнт',
        birthDate: '2025-11-10',
        status: 'sold',
        price: 45000,
        photoUrl: '/images/kitten-1.png',
        parentId: cat3.id,
        litterId: litter1.id,
        description: 'Нежная и ласковая малышка. Уехала в новый дом в Москву.',
      },
      {
        name: 'Снежинка',
        gender: 'female',
        color: 'Блю пойнт',
        birthDate: '2025-11-10',
        status: 'available',
        price: 45000,
        photoUrl: '/images/kitten-1.png',
        parentId: cat3.id,
        litterId: litter1.id,
        description: 'Очаровательная малышка с нежным характером и яркими голубыми глазами.',
      },
      {
        name: 'Барон',
        gender: 'male',
        color: 'Сил тэбби пойнт',
        birthDate: '2025-11-10',
        status: 'reserved',
        price: 50000,
        photoUrl: '/images/kitten-2.png',
        parentId: cat1.id,
        litterId: litter1.id,
        description: 'Крепкий и активный котик, копия папы.',
      },
    ],
  });

  // Litter 2 kittens (litter B — newer, mostly available)
  await prisma.kitten.createMany({
    data: [
      {
        name: 'Метель',
        gender: 'female',
        color: 'Крем пойнт',
        birthDate: '2026-01-25',
        status: 'available',
        price: 40000,
        photoUrl: '/images/kitten-1.png',
        parentId: cat4.id,
        litterId: litter2.id,
        description: 'Ласковая и игривая малышка с редким окрасом.',
      },
      {
        name: 'Ветер',
        gender: 'male',
        color: 'Сил пойнт',
        birthDate: '2026-01-25',
        status: 'evaluation',
        photoUrl: '/images/kitten-2.png',
        parentId: cat2.id,
        litterId: litter2.id,
        description: 'Перспективный кот, оставлен для оценки.',
      },
      {
        name: 'Буран',
        gender: 'male',
        color: 'Сил тэбби пойнт',
        birthDate: '2026-01-25',
        status: 'available',
        price: 48000,
        photoUrl: '/images/kitten-2.png',
        parentId: cat2.id,
        litterId: litter2.id,
        description: 'Активный и любопытный котик, отличный компаньон.',
      },
      {
        name: 'Блик',
        gender: 'male',
        color: 'Блю пойнт',
        birthDate: '2026-01-25',
        status: 'available',
        price: 47000,
        photoUrl: '/images/kitten-2.png',
        parentId: cat2.id,
        litterId: litter2.id,
        description: 'Спокойный и ласковый мальчик с глубоким голубым окрасом.',
      },
    ],
  });
  console.log('✓ 7 kittens in 2 litters created');

  // Create gallery images
  await prisma.galleryImage.createMany({
    data: [
      { url: '/images/hero-cat.png', caption: 'Наша гордость', sortOrder: 1 },
      { url: '/images/cat-male-1.png', caption: 'Гранд Лорд Арктур', sortOrder: 2 },
      { url: '/images/cat-female-1.png', caption: 'Бриллиант Нева', sortOrder: 3 },
      { url: '/images/cat-male-2.png', caption: 'Северный Шторм', sortOrder: 4 },
      { url: '/images/cat-female-2.png', caption: 'Снежная Королева', sortOrder: 5 },
      { url: '/images/kitten-1.png', caption: 'Наши котята', sortOrder: 6 },
      { url: '/images/kitten-2.png', caption: 'Игры котят', sortOrder: 7 },
    ],
  });
  console.log('✓ 7 gallery images created');

  // Create site content
  await prisma.siteContent.createMany({
    data: [
      { key: 'hero_title', value: 'Blue Sea' },
      { key: 'hero_subtitle', value: 'Питомник невских маскарадных кошек' },
      { key: 'hero_description', value: 'Породистые невские маскарадные кошки с сибирским характером и королевской грацией' },
      { key: 'about_title', value: 'Традиции породы' },
      { key: 'about_text', value: 'Питомник Blue Sea — это семейное дело, основанное на глубокой любви к невским маскарадным кошкам.' },
      { key: 'contact_phone', value: '+7 (900) 123-45-67' },
      { key: 'contact_email', value: 'info@bluesea-cattery.ru' },
      { key: 'contact_address', value: 'Санкт-Петербург, Россия' },
    ],
  });
  console.log('✓ Site content created');

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
