import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const adminOnlySeed =
  process.argv.includes("--admin-only") ||
  process.env.SEED_ADMIN_ONLY === "true" ||
  process.env.NODE_ENV === "production";

async function main() {
  console.log(
    adminOnlySeed
      ? "Seeding production admin credentials only..."
      : "Seeding database with full catalog data...",
  );

  const passwordHash = await bcrypt.hash("password123", 12);

  await prisma.user.upsert({
    where: { email: "admin@gadgethub.local" },
    update: {
      passwordHash,
      name: "Super Admin",
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
    create: {
      email: "admin@gadgethub.local",
      name: "Super Admin",
      passwordHash,
      role: Role.SUPER_ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: "manager@gadgethub.local" },
    update: {
      passwordHash,
      name: "Store Manager",
      role: Role.MANAGER,
      isActive: true,
    },
    create: {
      email: "manager@gadgethub.local",
      name: "Store Manager",
      passwordHash,
      role: Role.MANAGER,
    },
  });

  await prisma.user.upsert({
    where: { email: "customer@gadgethub.local" },
    update: {
      passwordHash,
      name: "Test Customer",
      role: Role.CUSTOMER,
      isActive: true,
    },
    create: {
      email: "customer@gadgethub.local",
      name: "Test Customer",
      passwordHash,
      role: Role.CUSTOMER,
    },
  });

  if (adminOnlySeed) {
    console.log("Production admin credentials are present.");
    return;
  }

  // 2. Create Brands
  const brandsData = [
    { name: "Apple", slug: "apple" },
    { name: "Samsung", slug: "samsung" },
    { name: "ASUS", slug: "asus" },
    { name: "Sony", slug: "sony" },
    { name: "Dell", slug: "dell" },
    { name: "Logitech", slug: "logitech" },
    { name: "Circu SoundLabs", slug: "circu-soundlabs" },
    { name: "Vertex", slug: "vertex" },
    { name: "X-Compute", slug: "x-compute" },
  ];

  const brands: Record<string, any> = {};
  for (const b of brandsData) {
    brands[b.slug] = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: b,
    });
  }

  // 3. Create Categories
  const categoriesData = [
    { name: "Laptops", slug: "laptops", prefix: "LAP" },
    { name: "Smartphones", slug: "smartphones", prefix: "SMP" },
    { name: "Monitors", slug: "monitors", prefix: "MNT" },
    { name: "Audio", slug: "audio", prefix: "AUD" },
  ];

  const categories: Record<string, any> = {};
  for (const c of categoriesData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }

  // Clear carts, orders, and wishlists first to cascade delete items
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.wishlistItem.deleteMany();

  // Clear products first to cascade delete product_variants and product_attributes
  await prisma.product.deleteMany();
  await prisma.categoryAttributeMap.deleteMany();

  // 4. Create Attribute Groups and Values
  // We'll reset attribute groups first to ensure clean state
  await prisma.attributeValue.deleteMany();
  await prisma.attributeGroup.deleteMany();

  const groupsData = [
    {
      name: "System RAM",
      unit: "GB",
      isVariantDefining: true,
      values: ["8", "16", "32", "64"],
    },
    {
      name: "Internal Storage",
      isVariantDefining: true,
      values: [
        "256GB SSD",
        "512GB SSD",
        "1TB SSD",
        "2TB SSD",
        "128GB",
        "256GB",
        "512GB",
      ],
    },
    {
      name: "Processor Tech",
      isVariantDefining: false,
      values: [
        "Apple M2",
        "Apple M3",
        "Apple M4 Series",
        "Intel Ultra Core",
        "AMD Ryzen Thread",
        "ARM Apex Silicon",
        "Snapdragon 8 Gen 2",
        "Snapdragon 8 Gen 3",
      ],
    },
    {
      name: "Screen Size",
      unit: "inches",
      isVariantDefining: false,
      values: [
        "13-inch",
        "14-inch",
        "16-inch",
        "17-inch",
        "6.1",
        "6.8",
        "27",
        "32",
      ],
    },
    {
      name: "Transducer Element",
      isVariantDefining: false,
      values: ["50mm Electrostatic", "40mm Dynamic", "Planar Magnetic"],
    },
    {
      name: "Wireless Connection Protocol",
      isVariantDefining: false,
      values: ["Bluetooth 5.3", "Bluetooth 5.4 aptX", "Wi-Fi 7"],
    },
  ];

  const attrs: Record<string, any> = {};
  for (const g of groupsData) {
    attrs[g.name] = await prisma.attributeGroup.create({
      data: {
        name: g.name,
        unit: g.unit,
        isVariantDefining: g.isVariantDefining,
        values: {
          create: g.values.map((v, idx) => ({ value: v, sortOrder: idx + 1 })),
        },
      },
      include: { values: true },
    });
  }

  // Helper to find value ID
  const valId = (groupName: string, valStr: string) => {
    const group = attrs[groupName];
    if (!group) throw new Error(`Group ${groupName} not found`);
    const val = group.values.find((v: any) => v.value === valStr);
    if (!val) throw new Error(`Value ${valStr} not found in ${groupName}`);
    return val.id;
  };

  // 5. Map Attributes to Categories
  await prisma.categoryAttributeMap.deleteMany();

  const mapData = [
    // Laptops
    { cat: "laptops", group: "System RAM", order: 1 },
    { cat: "laptops", group: "Internal Storage", order: 2 },
    { cat: "laptops", group: "Processor Tech", order: 3 },
    { cat: "laptops", group: "Screen Size", order: 4 },
    // Smartphones
    { cat: "smartphones", group: "System RAM", order: 1 },
    { cat: "smartphones", group: "Internal Storage", order: 2 },
    { cat: "smartphones", group: "Processor Tech", order: 3 },
    { cat: "smartphones", group: "Screen Size", order: 4 },
    // Monitors
    { cat: "monitors", group: "Screen Size", order: 1 },
    // Audio
    { cat: "audio", group: "Transducer Element", order: 1 },
    { cat: "audio", group: "Wireless Connection Protocol", order: 2 },
  ];

  for (const m of mapData) {
    await prisma.categoryAttributeMap.create({
      data: {
        categoryId: categories[m.cat].id,
        attributeGroupId: attrs[m.group].id,
        displayOrder: m.order,
      },
    });
  }

  // 6. Create Products
  await prisma.product.deleteMany(); // Reset products for clean seed

  const productsToSeed = [
    {
      name: "MacBook Air M2",
      slug: "macbook-air-m2",
      cat: "laptops",
      brand: "apple",
      variants: [
        {
          sku: "LAP-001",
          price: 999,
          attrs: {
            "System RAM": "8",
            "Internal Storage": "256GB SSD",
            "Processor Tech": "Apple M2",
            "Screen Size": "13-inch",
          },
        },
        {
          sku: "LAP-002",
          price: 1199,
          attrs: {
            "System RAM": "16",
            "Internal Storage": "512GB SSD",
            "Processor Tech": "Apple M2",
            "Screen Size": "13-inch",
          },
        },
      ],
    },
    {
      name: "MacBook Pro M3",
      slug: "macbook-pro-m3",
      cat: "laptops",
      brand: "apple",
      variants: [
        {
          sku: "LAP-003",
          price: 1599,
          attrs: {
            "System RAM": "16",
            "Internal Storage": "512GB SSD",
            "Processor Tech": "Apple M3",
            "Screen Size": "14-inch",
          },
        },
        {
          sku: "LAP-004",
          price: 1999,
          attrs: {
            "System RAM": "32",
            "Internal Storage": "1TB SSD",
            "Processor Tech": "Apple M3",
            "Screen Size": "14-inch",
          },
        },
      ],
    },
    {
      name: "Dell XPS 16",
      slug: "dell-xps-16",
      cat: "laptops",
      brand: "dell",
      variants: [
        {
          sku: "LAP-005",
          price: 1899,
          attrs: {
            "System RAM": "32",
            "Internal Storage": "1TB SSD",
            "Processor Tech": "Intel Ultra Core",
            "Screen Size": "16-inch",
          },
        },
      ],
    },
    {
      name: "ASUS ROG Zephyrus",
      slug: "asus-rog",
      cat: "laptops",
      brand: "asus",
      variants: [
        {
          sku: "LAP-006",
          price: 2199,
          attrs: {
            "System RAM": "64",
            "Internal Storage": "2TB SSD",
            "Processor Tech": "AMD Ryzen Thread",
            "Screen Size": "16-inch",
          },
        },
      ],
    },
    {
      name: "X-Compute Workstation",
      slug: "x-compute-workstation",
      cat: "laptops",
      brand: "x-compute",
      variants: [
        {
          sku: "LAP-007",
          price: 2999,
          attrs: {
            "System RAM": "64",
            "Internal Storage": "2TB SSD",
            "Processor Tech": "ARM Apex Silicon",
            "Screen Size": "17-inch",
          },
        },
      ],
    },
    {
      name: "Galaxy S23 Ultra",
      slug: "s23-ultra",
      cat: "smartphones",
      brand: "samsung",
      variants: [
        {
          sku: "SMP-001",
          price: 1199,
          attrs: {
            "System RAM": "8",
            "Internal Storage": "256GB",
            "Processor Tech": "Snapdragon 8 Gen 2",
            "Screen Size": "6.8",
          },
        },
      ],
    },
    {
      name: "Galaxy S24 Ultra",
      slug: "s24-ultra",
      cat: "smartphones",
      brand: "samsung",
      variants: [
        {
          sku: "SMP-002",
          price: 1299,
          attrs: {
            "System RAM": "16",
            "Internal Storage": "512GB",
            "Processor Tech": "Snapdragon 8 Gen 3",
            "Screen Size": "6.8",
          },
        },
      ],
    },
    {
      name: "iPhone 15 Pro",
      slug: "iphone-15-pro",
      cat: "smartphones",
      brand: "apple",
      variants: [
        {
          sku: "SMP-003",
          price: 999,
          attrs: {
            "System RAM": "8",
            "Internal Storage": "256GB",
            "Processor Tech": "Apple M3",
            "Screen Size": "6.1",
          },
        },
      ],
    },
    {
      name: "Dell UltraSharp 27",
      slug: "dell-u27",
      cat: "monitors",
      brand: "dell",
      variants: [
        { sku: "MNT-001", price: 599, attrs: { "Screen Size": "27" } },
      ],
    },
    {
      name: "Dell UltraSharp 32 4K",
      slug: "dell-u32",
      cat: "monitors",
      brand: "dell",
      variants: [
        { sku: "MNT-002", price: 899, attrs: { "Screen Size": "32" } },
      ],
    },
    {
      name: "Sony WH-1000XM5",
      slug: "sony-xm5",
      cat: "audio",
      brand: "sony",
      variants: [
        {
          sku: "AUD-001",
          price: 399,
          attrs: {
            "Transducer Element": "40mm Dynamic",
            "Wireless Connection Protocol": "Bluetooth 5.3",
          },
        },
      ],
    },
    {
      name: "Circu Studio Pro",
      slug: "circu-studio-pro",
      cat: "audio",
      brand: "circu-soundlabs",
      variants: [
        {
          sku: "AUD-002",
          price: 599,
          attrs: {
            "Transducer Element": "50mm Electrostatic",
            "Wireless Connection Protocol": "Bluetooth 5.4 aptX",
          },
        },
      ],
    },
    {
      name: "Vertex Earbuds",
      slug: "vertex-earbuds",
      cat: "audio",
      brand: "vertex",
      variants: [
        {
          sku: "AUD-003",
          price: 149,
          attrs: {
            "Transducer Element": "40mm Dynamic",
            "Wireless Connection Protocol": "Bluetooth 5.3",
          },
        },
      ],
    },
    {
      name: "Logitech MX Master 3S",
      slug: "logi-mx3s",
      cat: "audio",
      brand: "logitech", // just throwing it in a category
      variants: [{ sku: "AUD-004", price: 99, attrs: {} }],
    },
    {
      name: "ASUS ROG Swift 27",
      slug: "asus-rog-27",
      cat: "monitors",
      brand: "asus",
      variants: [
        { sku: "MNT-003", price: 799, attrs: { "Screen Size": "27" } },
      ],
    },
    {
      name: "Apple Studio Display",
      slug: "apple-studio-display",
      cat: "monitors",
      brand: "apple",
      variants: [
        { sku: "MNT-004", price: 1599, attrs: { "Screen Size": "27" } },
      ],
    },
  ];

  // Map product slugs to their image paths
  const productMediaMap: Record<string, string[]> = {
    "macbook-air-m2": ["/products/laptops/macbook-air-m2-1.jpg"],
    "macbook-pro-m3": ["/products/laptops/macbook-pro-m3-1.jpg"],
    "dell-xps-16": ["/products/laptops/dell-xps-16-1.jpg"],
    "asus-rog": ["/products/laptops/asus-rog-zephyrus-1.jpg"],
    "x-compute-workstation": ["/products/laptops/x-compute-workstation-1.jpg"],
    "s23-ultra": ["/products/smartphones/samsung-s23-ultra-1.jpg"],
    "s24-ultra": ["/products/smartphones/samsung-s24-ultra-1.jpg"],
    "iphone-15-pro": ["/products/smartphones/iphone-15-pro-1.jpg"],
    "dell-u27": ["/products/monitors/dell-ultrasharp-27-1.jpg"],
    "dell-u32": ["/products/monitors/dell-ultrasharp-32-4k-1.jpg"],
    "sony-xm5": ["/products/audio/sony-wh-1000xm5-1.jpg"],
    "circu-studio-pro": ["/products/audio/circu-studio-pro-1.jpg"],
    "vertex-earbuds": ["/products/audio/vertex-earbuds-1.jpg"],
    "logi-mx3s": ["/products/audio/logitech-mx-master-3s-1.jpg"],
    "asus-rog-27": ["/products/monitors/asus-rog-swift-27-1.jpg"],
    "apple-studio-display": ["/products/monitors/apple-studio-display-1.jpg"],
  };

  for (const p of productsToSeed) {
    const createdProduct = await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: `Experience the amazing ${p.name}.`,
        categoryId: categories[p.cat].id,
        brandId: brands[p.brand].id,
        status: "ACTIVE",
        isFeatured: true,
        variants: {
          create: p.variants.map((v) => {
            const attrCreates = Object.entries(v.attrs).map(
              ([gName, valName]) => ({
                attributeValueId: valId(gName, valName as string),
              }),
            );

            return {
              sku: v.sku,
              price: v.price,
              stock: 50,
              isActive: true,
              attributes: {
                create: attrCreates,
              },
            };
          }),
        },
      },
    });

    // Add product media
    const imageUrls = productMediaMap[p.slug] || [];
    for (let i = 0; i < imageUrls.length; i++) {
      await prisma.productMedia.create({
        data: {
          productId: createdProduct.id,
          url: imageUrls[i],
          altText: `${p.name} - Image ${i + 1}`,
          isPrimary: i === 0,
          sortOrder: i,
        },
      });
    }
  }

  console.log("Seeding finished.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
