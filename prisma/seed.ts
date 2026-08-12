import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('Seeding database...');

  // 1. Create Users
  const passwordHash = await bcrypt.hash('password123', 12);
  
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@gadgethub.local' },
    update: {},
    create: {
      email: 'admin@gadgethub.local',
      name: 'Super Admin',
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@gadgethub.local' },
    update: {},
    create: {
      email: 'manager@gadgethub.local',
      name: 'Store Manager',
      passwordHash,
      role: Role.MANAGER,
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@gadgethub.local' },
    update: {},
    create: {
      email: 'customer@gadgethub.local',
      name: 'Test Customer',
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  // 2. Create Brands
  const apple = await prisma.brand.upsert({
    where: { slug: 'apple' },
    update: {},
    create: { name: 'Apple', slug: 'apple' },
  });

  const samsung = await prisma.brand.upsert({
    where: { slug: 'samsung' },
    update: {},
    create: { name: 'Samsung', slug: 'samsung' },
  });

  const asus = await prisma.brand.upsert({
    where: { slug: 'asus' },
    update: {},
    create: { name: 'ASUS', slug: 'asus' },
  });

  // 3. Create Categories
  const laptops = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: { name: 'Laptops', slug: 'laptops', prefix: 'LAP' },
  });

  const smartphones = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: { name: 'Smartphones', slug: 'smartphones', prefix: 'SMP' },
  });

  // 4. Create Attribute Groups and Values
  // -- RAM --
  const attrRam = await prisma.attributeGroup.create({
    data: {
      name: 'RAM',
      unit: 'GB',
      isVariantDefining: true,
      values: {
        create: [
          { value: '8', sortOrder: 1 },
          { value: '16', sortOrder: 2 },
          { value: '32', sortOrder: 3 },
        ],
      },
    },
    include: { values: true },
  });

  // -- Storage --
  const attrStorage = await prisma.attributeGroup.create({
    data: {
      name: 'Storage',
      isVariantDefining: true,
      values: {
        create: [
          { value: '256GB SSD', sortOrder: 1 },
          { value: '512GB SSD', sortOrder: 2 },
          { value: '1TB SSD', sortOrder: 3 },
          { value: '128GB', sortOrder: 1 },
          { value: '256GB', sortOrder: 2 },
        ],
      },
    },
    include: { values: true },
  });

  // -- Processor --
  const attrProcessor = await prisma.attributeGroup.create({
    data: {
      name: 'Processor',
      isVariantDefining: false,
      values: {
        create: [
          { value: 'Apple M2' },
          { value: 'Apple M3' },
          { value: 'Snapdragon 8 Gen 2' },
          { value: 'Intel Core i7-13700H' },
        ],
      },
    },
    include: { values: true },
  });

  // -- Screen --
  const attrScreen = await prisma.attributeGroup.create({
    data: {
      name: 'Screen Size',
      unit: 'inches',
      isVariantDefining: false,
      values: {
        create: [
          { value: '13.6' },
          { value: '14' },
          { value: '15.6' },
          { value: '6.1' },
          { value: '6.8' },
        ],
      },
    },
    include: { values: true },
  });

  // 5. Map Attributes to Categories
  await prisma.categoryAttributeMap.createMany({
    data: [
      // Laptops map
      { categoryId: laptops.id, attributeGroupId: attrRam.id, displayOrder: 1 },
      { categoryId: laptops.id, attributeGroupId: attrStorage.id, displayOrder: 2 },
      { categoryId: laptops.id, attributeGroupId: attrProcessor.id, displayOrder: 3 },
      { categoryId: laptops.id, attributeGroupId: attrScreen.id, displayOrder: 4 },
      // Smartphones map
      { categoryId: smartphones.id, attributeGroupId: attrRam.id, displayOrder: 1 },
      { categoryId: smartphones.id, attributeGroupId: attrStorage.id, displayOrder: 2 },
      { categoryId: smartphones.id, attributeGroupId: attrProcessor.id, displayOrder: 3 },
      { categoryId: smartphones.id, attributeGroupId: attrScreen.id, displayOrder: 4 },
    ],
    skipDuplicates: true,
  });

  // 6. Create Products with Variants
  // Product 1: MacBook Air M2
  const macbook = await prisma.product.create({
    data: {
      name: 'MacBook Air M2',
      slug: 'macbook-air-m2',
      description: 'Supercharged by M2. Strikingly thin design.',
      categoryId: laptops.id,
      brandId: apple.id,
      status: 'ACTIVE',
      useCaseTags: ['work', 'study', 'content creation'],
      isFeatured: true,
      variants: {
        create: [
          {
            sku: 'LAP-0001',
            price: 999,
            stock: 50,
            attributes: {
              create: [
                { attributeValueId: attrRam.values.find((v) => v.value === '8')!.id },
                { attributeValueId: attrStorage.values.find((v) => v.value === '256GB SSD')!.id },
                { attributeValueId: attrProcessor.values.find((v) => v.value === 'Apple M2')!.id },
                { attributeValueId: attrScreen.values.find((v) => v.value === '13.6')!.id },
              ],
            },
          },
          {
            sku: 'LAP-0002',
            price: 1199,
            stock: 20,
            attributes: {
              create: [
                { attributeValueId: attrRam.values.find((v) => v.value === '16')!.id },
                { attributeValueId: attrStorage.values.find((v) => v.value === '512GB SSD')!.id },
                { attributeValueId: attrProcessor.values.find((v) => v.value === 'Apple M2')!.id },
                { attributeValueId: attrScreen.values.find((v) => v.value === '13.6')!.id },
              ],
            },
          },
        ],
      },
    },
  });

  // Product 2: Samsung Galaxy S23 Ultra
  const s23 = await prisma.product.create({
    data: {
      name: 'Samsung Galaxy S23 Ultra',
      slug: 'samsung-galaxy-s23-ultra',
      description: 'Epic nights are coming. The latest Galaxy S series.',
      categoryId: smartphones.id,
      brandId: samsung.id,
      status: 'ACTIVE',
      useCaseTags: ['gaming', 'photography', 'everyday'],
      variants: {
        create: [
          {
            sku: 'SMP-0001',
            price: 1199,
            salePrice: 1099,
            stock: 100,
            attributes: {
              create: [
                { attributeValueId: attrRam.values.find((v) => v.value === '8')!.id },
                { attributeValueId: attrStorage.values.find((v) => v.value === '256GB')!.id },
                { attributeValueId: attrProcessor.values.find((v) => v.value === 'Snapdragon 8 Gen 2')!.id },
                { attributeValueId: attrScreen.values.find((v) => v.value === '6.8')!.id },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
