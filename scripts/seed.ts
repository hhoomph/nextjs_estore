/**
 * Seeds the storefront with the authentic catalog defined in scripts/data/catalog.ts.
 *
 * Run with:  bun run db:seed
 * Force a full rebuild of product content:  bun run scripts/seed.ts --force
 */
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../node_modules/better-auth/node_modules/@better-auth/utils/dist/password.node.mjs";
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { catalogCategories, catalogProducts } from "./data/catalog";
import productImages from "./data/product-images.json";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const FORCE = process.argv.includes("--force");
const imageMap = productImages as Record<string, string[]>;

const FALLBACK_IMAGE = "/placeholder-product.svg";

const REVIEW_VOICES: Record<string, string[]> = {
  audio: [
    "Noise cancellation is genuinely impressive on my commute, and the battery easily lasts a week of daily use.",
    "Sound is balanced and clear; the fit stayed comfortable through a six-hour flight.",
    "Pairing was instant and calls sound clear on the other end. Exactly what I needed for work.",
  ],
  computers: [
    "Build quality feels a tier above the price, and it has replaced two other devices on my desk.",
    "Setup took five minutes and it has been rock solid through full work weeks.",
    "Does exactly what it promises, with no driver headaches on macOS or Windows.",
  ],
  smartphones: [
    "Battery easily gets me through a heavy day, and the camera has replaced my point-and-shoot.",
    "The screen is bright enough to read in direct sunlight, which was my main complaint with my old phone.",
    "Fast, responsive and the update commitment is the reason I switched.",
  ],
  "home-kitchen": [
    "Used it almost every day for a month and it still looks new. Worth the counter space.",
    "Results are consistent and cleanup is genuinely easy, which matters more than I expected.",
    "Replaced two older appliances with this one and the kitchen feels less cluttered.",
  ],
  fashion: [
    "True to size and the materials feel substantially better than the price suggests.",
    "Comfortable straight out of the box, no break-in period needed.",
    "Looks sharp with everything I own and has held up well after several washes.",
  ],
  sports: [
    "Solid construction and it has handled three months of regular use without any wear issues.",
    "Does the job well and packs down smaller than I expected for trips.",
    "Comfortable enough for long sessions and the quality is obvious the moment you pick it up.",
  ],
  beauty: [
    "Gentle enough for daily use and I noticed a difference within two weeks.",
    "No irritation, no fragrance, and it layers well under sunscreen.",
    "A reliable staple that I have already repurchased.",
  ],
  books: [
    "Dense but practical, with examples I could apply to my own code the same week.",
    "One of those books I keep going back to; the advice has aged well.",
    "Clear writing and concrete exercises, which is rare for this genre.",
  ],
};

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function buildDescription(product: (typeof catalogProducts)[number]): string {
  const highlights = product.features.map((feature) => `• ${feature}`).join("\n");
  const specs = product.specs.map((spec) => `• ${spec.label}: ${spec.value}`).join("\n");
  return `${product.description}\n\nHighlights\n${highlights}\n\nSpecifications\n${specs}`;
}

async function seedCategories() {
  const keepIds = new Set(catalogCategories.map((category) => category.id));
  const existingCategories = await prisma.category.findMany({ select: { id: true } });
  const staleCategories = existingCategories.filter((category) => !keepIds.has(category.id));

  if (staleCategories.length > 0) {
    await prisma.category.deleteMany({
      where: { id: { in: staleCategories.map((category) => category.id) } },
    });
    console.log(`🧹 Removed ${staleCategories.length} legacy categories`);
  }

  for (const [index, category] of catalogCategories.entries()) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: { name: category.name, modifiedAt: new Date() },
      create: {
        id: category.id,
        name: category.name,
        level: 1,
        modifiedAt: new Date(),
      },
    });
    void index;
  }
  console.log(`📂 Categories ready (${catalogCategories.length})`);
}

async function seedSiteSettings() {
  // There must be exactly one settings row; older versions of the app created duplicates.
  await prisma.siteSettings.deleteMany({ where: { id: { not: "default" } } });

  const existing = await prisma.siteSettings.findUnique({ where: { id: "default" } });

  const brandContent = {
    siteTitleEn: "Northline Supply",
    siteTitleFa: "نورث‌لاین",
    descriptionEn:
      "Everyday essentials and considered upgrades for your desk, kitchen and travels, shipped from our own warehouse.",
    descriptionFa:
      "لوازم ضروری روزمره و ارتقاهای کاربردی برای میز کار، آشپزخانه و سفر، ارسال‌شده از انبار اختصاصی ما.",
    defaultSeoTitle: "Northline Supply — Everyday essentials, upgraded",
    defaultSeoDescription:
      "Shop audio, computing, home and outdoor essentials at Northline Supply. Free shipping over $75 and 30-day returns.",
    defaultCurrency: "USD",
    lowStockThreshold: 10,
  };

  const needsBranding =
    !existing ||
    !existing.siteTitleEn ||
    existing.siteTitleEn === "E-commerce Store" ||
    existing.siteTitleEn === "My E-commerce Store";

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: needsBranding ? brandContent : {},
    create: { id: "default", ...brandContent },
  });

  console.log("⚙️  Site settings ready");
}

async function seedProducts() {
  const keepIds = new Set(catalogProducts.map((product) => product.id));

  // Remove anything that is not part of the curated catalog (legacy demo data).
  const existing = await prisma.product.findMany({ select: { id: true } });
  const stale = existing.filter((product) => !keepIds.has(product.id));

  if (stale.length > 0) {
    const staleIds = stale.map((product) => product.id);
    await prisma.productPicture.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.review.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.cartItem.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.wishlist.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.orderItem.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.recentlyViewed.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.collectionProduct.deleteMany({ where: { productId: { in: staleIds } } });
    await prisma.product.deleteMany({ where: { id: { in: staleIds } } });
    console.log(`🧹 Removed ${stale.length} legacy product(s)`);
  }

  // Rebuild all product imagery from the curated catalog.
  await prisma.productPicture.deleteMany({});
  await prisma.picture.deleteMany({});

  const now = Date.now();

  for (const [index, product] of catalogProducts.entries()) {
    const images = imageMap[product.id] ?? [];
    const primaryImage = images[0] ?? FALLBACK_IMAGE;
    const createdAt = new Date(now - index * 36 * 60 * 60 * 1000);

    const data = {
      name: product.name,
      desc: buildDescription(product),
      slug: product.slug,
      categoryId: product.categoryId,
      quantity: product.stock,
      price: product.price.toFixed(2),
      discountPrice: product.discountPrice !== undefined ? product.discountPrice.toFixed(2) : null,
      ogImage: primaryImage,
      seoTitle: product.seoTitle,
      seoDescription: product.seoDescription,
      seoKeywords: product.seoKeywords.join(", "),
      status: 1,
      createdAt,
      modifiedAt: new Date(),
    };

    await prisma.product.upsert({
      where: { id: product.id },
      update: data,
      create: { id: product.id, ...data },
    });

    // Attach the curated local photography for this product.
    const gallery = images.length > 0 ? images : [FALLBACK_IMAGE];
    for (const [order, url] of gallery.entries()) {
      const pictureId = `${product.id}-picture-${order + 1}`;
      await prisma.picture.upsert({
        where: { id: pictureId },
        update: { url, type: "product", modifiedAt: new Date() },
        create: { id: pictureId, url, type: "product", modifiedAt: new Date() },
      });
      await prisma.productPicture.create({
        data: {
          id: randomUUID(),
          pictureId,
          productId: product.id,
          displayOrder: order,
        },
      });
    }
  }

  console.log(`📦 Products ready (${catalogProducts.length})`);
}

async function seedCollections() {
  await prisma.collectionProduct.deleteMany({});
  await prisma.collection.deleteMany({});

  const sale = catalogProducts.filter((product) => product.discountPrice !== undefined);
  const featured = [...catalogProducts]
    .sort((a, b) => (b.discountPrice ? 1 : 0) - (a.discountPrice ? 1 : 0) || b.price - a.price)
    .slice(0, 12);
  const bestSellers = [...catalogProducts].sort((a, b) => b.stock - a.stock).slice(0, 12);
  const newArrivals = [...catalogProducts].slice(-12);

  const collections = [
    { name: "Featured Products", description: "Hand-picked products our customers rate highest.", products: featured },
    { name: "Best Sellers", description: "The products that move fastest in our catalogue.", products: bestSellers },
    { name: "On Sale", description: "Current discounts across audio, home and everyday essentials.", products: sale },
    { name: "New Arrivals", description: "The latest additions to the store.", products: newArrivals },
  ];

  for (const [index, collection] of collections.entries()) {
    const record = await prisma.collection.create({
      data: {
        id: randomUUID(),
        name: collection.name,
        description: collection.description,
        slug: collection.name.toLowerCase().replace(/\s+/g, "-"),
        isActive: true,
        sortOrder: index,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    for (const [order, product] of collection.products.entries()) {
      await prisma.collectionProduct.create({
        data: {
          id: randomUUID(),
          collectionId: record.id,
          productId: product.id,
          displayOrder: order,
        },
      });
    }
  }

  console.log(`📚 Collections ready (${collections.length})`);
}

async function seedUsers() {
  
  const accounts = [
    { email: "admin@example.com", name: "Store Administrator", role: "ADMIN" as const, password: "admin123456" },
    { email: "test@example.com", name: "Test Customer", role: "USER" as const, password: "password" },
  ];

  for (const account of accounts) {
    const user = await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, role: account.role },
      create: {
        id: randomUUID(),
        email: account.email,
        name: account.name,
        role: account.role,
        active: true,
        emailVerified: true,
        createdAt: new Date(),
      },
    });

    await prisma.account.upsert({
      where: { providerId_accountId: { providerId: "credential", accountId: user.id } },
      update: { password: await hashPassword(account.password) },
      create: {
        id: randomUUID(),
        accountId: user.id,
        userId: user.id,
        providerId: "credential",
        issuer: "local:credential",
        password: await hashPassword(account.password),
      },
    });
  }

  const reviewerNames = [
    "Daniel Okafor", "Priya Raman", "Marta Kowalski", "Tomás Ferreira", "Aisha Rahman",
    "Jonas Lindqvist", "Chen Wei", "Elena Petrova", "Marcus Webb", "Sofia Rossi",
    "Noah Bergström", "Yuki Tanaka", "Amara Diallo", "Liam O'Connor", "Zara Haddad",
    "Ethan Brooks", "Nadia Farouk", "Oliver Schmidt", "Camila Duarte", "Ravi Patel",
  ];

  const reviewers = [];
  for (const [index, name] of reviewerNames.entries()) {
    const email = `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name },
      create: {
        id: randomUUID(),
        email,
        name,
        role: "USER",
        active: true,
        emailVerified: true,
        createdAt: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000),
      },
    });
    reviewers.push(user);
  }

  console.log(`👤 Users ready (${accounts.length + reviewers.length})`);
  return reviewers;
}

async function seedReviews(reviewers: { id: string }[]) {
  await prisma.review.deleteMany({});

  let created = 0;
  for (const product of catalogProducts) {
    const voices = REVIEW_VOICES[product.categoryId] ?? REVIEW_VOICES.audio;
    const seed = hashString(product.id);
    const reviewCount = 3 + (seed % 3); // 3-5 reviews per product

    for (let index = 0; index < reviewCount; index += 1) {
      const reviewer = reviewers[(seed + index * 7) % reviewers.length];
      const rating = 4 + ((seed + index) % 2 === 0 ? 1 : 0); // 4 or 5 stars
      const comment = voices[(seed + index) % voices.length];
      const daysAgo = 3 + ((seed + index * 13) % 90);

      await prisma.review.create({
        data: {
          id: randomUUID(),
          productId: product.id,
          userId: reviewer.id,
          rating,
          comment,
          status: "APPROVED",
          createdAt: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        },
      });
      created += 1;
    }
  }

  console.log(`⭐ Reviews ready (${created})`);
}

async function validate() {
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const pictureCount = await prisma.productPicture.count();
  const productsWithoutImages = await prisma.product.count({
    where: { productPictures: { none: {} } },
  });
  const productsWithoutCategory = await prisma.product.count({ where: { categoryId: "" } });

  console.log("\n🔍 Validation");
  console.log(`   products: ${productCount}`);
  console.log(`   categories: ${categoryCount}`);
  console.log(`   product pictures: ${pictureCount}`);
  console.log(`   products without images: ${productsWithoutImages}`);
  console.log(`   products without category: ${productsWithoutCategory}`);

  if (productsWithoutImages > 0) throw new Error("Some products have no images");
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  console.log("🌱 Seeding authentic storefront catalog...\n");

  await prisma.$connect();
  await seedCategories();
  await seedSiteSettings();
  await seedProducts();
  await seedCollections();
  const reviewers = await seedUsers();
  await seedReviews(reviewers);
  await validate();

  console.log("\n✅ Seed complete");
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
