import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

// Configuration
const SEED_CONFIG = {
  // Environment detection
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV === "development",

  // Data sizes
  categoriesCount: 8,
  productsPerCategory: 15,
  usersCount: 50,
  reviewsPerProduct: 5,

  // Features
  enableRollback: true,
  enableValidation: true,
  enableProgress: true,
};

// Progress tracking
class SeedProgress {
  private total = 0;
  private completed = 0;
  private startTime = Date.now();

  setTotal(total: number) {
    this.total = total;
  }

  increment() {
    this.completed++;
    this.logProgress();
  }

  private logProgress() {
    const percentage = Math.round((this.completed / this.total) * 100);
    const elapsed = Date.now() - this.startTime;
    const eta =
      this.completed > 0
        ? (elapsed / this.completed) * (this.total - this.completed)
        : 0;

    console.log(
      `📊 Progress: ${this.completed}/${this.total} (${percentage}%) - ETA: ${Math.round(eta / 1000)}s`,
    );
  }

  complete() {
    const elapsed = Date.now() - this.startTime;
    console.log(`✅ Completed in ${Math.round(elapsed / 1000)}s`);
  }
}

// Validation utilities
class SeedValidator {
  static async validateEnvironment() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    // Test database connection
    try {
      await prisma.$connect();
      console.log("🔗 Database connection established");
    } catch (error) {
      throw new Error(`Database connection failed: ${error}`);
    }
  }

  static async validateDataIntegrity() {
    const issues: string[] = [];

    // Basic integrity checks (skip null-reference checks because foreign keys are non-nullable)
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      issues.push(`No products found in database`);
    }

    const reviewCount = await prisma.review.count();
    if (reviewCount === 0) {
      issues.push(`No reviews found in database`);
    }

    if (issues.length > 0) {
      console.warn("⚠️  Data integrity issues found:", issues);
    }

    return issues.length === 0;
  }
}

// Rollback utilities
class SeedRollback {
  private operations: Array<() => Promise<void>> = [];

  addRollback(operation: () => Promise<void>) {
    this.operations.unshift(operation);
  }

  async execute() {
    console.log("🔄 Executing rollback...");
    for (const operation of this.operations) {
      try {
        await operation();
      } catch (error) {
        console.error("Rollback operation failed:", error);
      }
    }
    console.log("✅ Rollback completed");
  }
}

async function main() {
  const progress = new SeedProgress();
  const rollback = new SeedRollback();

  try {
    // Validate environment
    if (SEED_CONFIG.enableValidation) {
      await SeedValidator.validateEnvironment();
    }

    console.log("🌱 Starting enhanced database seeding...");
    console.log(
      `📊 Environment: ${SEED_CONFIG.isProduction ? "Production" : "Development"}`,
    );
    console.log(
      `🎯 Target: ${SEED_CONFIG.categoriesCount} categories, ${SEED_CONFIG.productsPerCategory} products each, ${SEED_CONFIG.usersCount} users`,
    );

    // Calculate total operations for progress tracking
    const totalOperations =
      SEED_CONFIG.categoriesCount +
      SEED_CONFIG.categoriesCount * SEED_CONFIG.productsPerCategory +
      SEED_CONFIG.usersCount +
      10; // Additional operations

    progress.setTotal(totalOperations);

    // Create comprehensive categories
    const categories = await createCategories(progress, rollback);
    console.log(`📂 Created ${categories.length} categories`);

    // Create products for each category
    const products = await createProducts(categories, progress, rollback);
    console.log(`📦 Created ${products.length} products`);

    // Create product images and media
    await createProductMedia(products, progress, rollback);
    console.log("🖼️ Created product images and media");

    // Create users and accounts
    const users = await createUsers(progress, rollback);
    console.log(`👤 Created ${users.length} users`);

    // Create reviews and ratings
    await createReviews(products, users, progress, rollback);
    console.log("⭐ Created product reviews");

    // Create collections and featured items
    await createCollections(products, progress, rollback);
    console.log("📚 Created product collections");

    // Validate data integrity
    if (SEED_CONFIG.enableValidation) {
      const isValid = await SeedValidator.validateDataIntegrity();
      if (!isValid) {
        console.warn("⚠️  Data integrity issues detected");
      }
    }

    progress.complete();

    console.log("✅ Database seeded successfully!");
    console.log("\n📋 Summary:");
    console.log(`   Categories: ${categories.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Users: ${users.length}`);
    console.log(
      `   Reviews: ${products.length * SEED_CONFIG.reviewsPerProduct}`,
    );

    console.log("\n🔐 Admin Credentials:");
    console.log("Email: admin@example.com");
    console.log("Role: ADMIN");
    console.log("Note: Set password during first admin login");

    console.log("\n🧪 Test User Credentials:");
    console.log("Email: test@example.com");
    console.log("Password: password");
    console.log("Role: USER");
  } catch (error) {
    console.error("❌ Error seeding database:", error);

    // Execute rollback if enabled
    if (SEED_CONFIG.enableRollback) {
      await rollback.execute();
    }

    process.exit(1);
  }
}

// Enhanced category creation
async function createCategories(
  progress: SeedProgress,
  rollback: SeedRollback,
) {
  const categoriesData = [
    {
      id: "electronics",
      name: "Electronics",
      description: "Electronic devices and gadgets",
    },
    { id: "fashion", name: "Fashion", description: "Clothing and accessories" },
    {
      id: "home-garden",
      name: "Home & Garden",
      description: "Home improvement and gardening",
    },
    {
      id: "sports",
      name: "Sports & Outdoors",
      description: "Sports equipment and outdoor gear",
    },
    { id: "books", name: "Books", description: "Books and publications" },
    {
      id: "beauty",
      name: "Beauty & Personal Care",
      description: "Cosmetics and personal care",
    },
    {
      id: "automotive",
      name: "Automotive",
      description: "Car parts and accessories",
    },
    { id: "toys", name: "Toys & Games", description: "Toys and entertainment" },
  ];

  const categories = [];

  for (const categoryData of categoriesData.slice(
    0,
    SEED_CONFIG.categoriesCount,
  )) {
    const category = await prisma.category.upsert({
      where: { id: categoryData.id },
      update: {},
      create: {
        id: categoryData.id,
        name: categoryData.name,
        level: 1,
        modifiedAt: new Date(),
      },
    });

    categories.push(category);
    progress.increment();

    // Add rollback operation
    rollback.addRollback(async () => {
      await prisma.category.deleteMany({ where: { id: category.id } });
    });
  }

  return categories;
}

// Enhanced product creation
async function createProducts(
  categories: any[],
  progress: SeedProgress,
  rollback: SeedRollback,
) {
  const products = [];
  const productTemplates = [
    // Electronics
    {
      name: "Wireless Bluetooth Headphones",
      price: 99.99,
      discountPrice: 79.99,
      categoryIndex: 0,
    },
    {
      name: "Smart Fitness Watch",
      price: 249.99,
      discountPrice: 199.99,
      categoryIndex: 0,
    },
    {
      name: "4K Ultra HD Monitor",
      price: 399.99,
      discountPrice: 349.99,
      categoryIndex: 0,
    },
    {
      name: "Wireless Gaming Mouse",
      price: 79.99,
      discountPrice: 59.99,
      categoryIndex: 0,
    },
    {
      name: "Mechanical Keyboard",
      price: 149.99,
      discountPrice: 129.99,
      categoryIndex: 0,
    },

    // Fashion
    { name: "Premium Leather Jacket", price: 299.99, categoryIndex: 1 },
    {
      name: "Designer Sunglasses",
      price: 199.99,
      discountPrice: 149.99,
      categoryIndex: 1,
    },
    {
      name: "Running Sneakers",
      price: 129.99,
      discountPrice: 99.99,
      categoryIndex: 1,
    },
    {
      name: "Cotton T-Shirt",
      price: 29.99,
      discountPrice: 19.99,
      categoryIndex: 1,
    },
    {
      name: "Denim Jeans",
      price: 89.99,
      discountPrice: 69.99,
      categoryIndex: 1,
    },

    // Home & Garden
    {
      name: "Programmable Coffee Maker",
      price: 89.99,
      discountPrice: 69.99,
      categoryIndex: 2,
    },
    {
      name: "Robot Vacuum Cleaner",
      price: 349.99,
      discountPrice: 299.99,
      categoryIndex: 2,
    },
    {
      name: "Garden Hose Set",
      price: 49.99,
      discountPrice: 39.99,
      categoryIndex: 2,
    },
    {
      name: "LED Desk Lamp",
      price: 79.99,
      discountPrice: 59.99,
      categoryIndex: 2,
    },
    {
      name: "Throw Pillow Set",
      price: 34.99,
      discountPrice: 24.99,
      categoryIndex: 2,
    },

    // Sports & Outdoors
    {
      name: "Yoga Mat Premium",
      price: 39.99,
      discountPrice: 29.99,
      categoryIndex: 3,
    },
    {
      name: "Adjustable Dumbbell Set",
      price: 199.99,
      discountPrice: 149.99,
      categoryIndex: 3,
    },
    {
      name: "Mountain Bike Helmet",
      price: 89.99,
      discountPrice: 69.99,
      categoryIndex: 3,
    },
    {
      name: "Camping Tent 4-Person",
      price: 249.99,
      discountPrice: 199.99,
      categoryIndex: 3,
    },
    {
      name: "Resistance Bands Kit",
      price: 29.99,
      discountPrice: 19.99,
      categoryIndex: 3,
    },

    // Books
    {
      name: "The Art of Programming",
      price: 49.99,
      discountPrice: 39.99,
      categoryIndex: 4,
    },
    {
      name: "JavaScript: The Good Parts",
      price: 34.99,
      discountPrice: 24.99,
      categoryIndex: 4,
    },
    {
      name: "Clean Code Handbook",
      price: 44.99,
      discountPrice: 34.99,
      categoryIndex: 4,
    },
    {
      name: "System Design Interview",
      price: 39.99,
      discountPrice: 29.99,
      categoryIndex: 4,
    },
    {
      name: "Data Structures & Algorithms",
      price: 54.99,
      discountPrice: 44.99,
      categoryIndex: 4,
    },

    // Beauty & Personal Care
    {
      name: "Organic Face Serum",
      price: 34.99,
      discountPrice: 24.99,
      categoryIndex: 5,
    },
    {
      name: "Professional Hair Dryer",
      price: 79.99,
      discountPrice: 59.99,
      categoryIndex: 5,
    },
    {
      name: "Essential Oils Collection",
      price: 44.99,
      discountPrice: 34.99,
      categoryIndex: 5,
    },
    {
      name: "Electric Toothbrush",
      price: 69.99,
      discountPrice: 49.99,
      categoryIndex: 5,
    },
    {
      name: "Moisturizing Cream Set",
      price: 29.99,
      discountPrice: 19.99,
      categoryIndex: 5,
    },

    // Automotive
    {
      name: "Dash Cam 4K",
      price: 129.99,
      discountPrice: 99.99,
      categoryIndex: 6,
    },
    {
      name: "Car Vacuum Cleaner",
      price: 59.99,
      discountPrice: 44.99,
      categoryIndex: 6,
    },
    {
      name: "LED Interior Lights Kit",
      price: 24.99,
      discountPrice: 19.99,
      categoryIndex: 6,
    },
    {
      name: "Portable Jump Starter",
      price: 89.99,
      discountPrice: 69.99,
      categoryIndex: 6,
    },
    {
      name: "Car Phone Mount",
      price: 19.99,
      discountPrice: 14.99,
      categoryIndex: 6,
    },

    // Toys & Games
    {
      name: "Building Blocks Set 1000pc",
      price: 49.99,
      discountPrice: 39.99,
      categoryIndex: 7,
    },
    {
      name: "Remote Control Car",
      price: 59.99,
      discountPrice: 44.99,
      categoryIndex: 7,
    },
    {
      name: "Board Game Collection",
      price: 34.99,
      discountPrice: 24.99,
      categoryIndex: 7,
    },
    {
      name: "Stuffed Animal Bear",
      price: 24.99,
      discountPrice: 19.99,
      categoryIndex: 7,
    },
    {
      name: "Science Experiment Kit",
      price: 39.99,
      discountPrice: 29.99,
      categoryIndex: 7,
    },
  ];

  for (const category of categories) {
    const categoryProducts = productTemplates
      .filter(
        (template) => template.categoryIndex === categories.indexOf(category),
      )
      .slice(0, SEED_CONFIG.productsPerCategory);

    for (const template of categoryProducts) {
      const productId = `${category.id}-${template.name.toLowerCase().replace(/\s+/g, "-")}`;
      const product = await prisma.product.upsert({
        where: { id: productId },
        update: {},
        create: {
          id: productId,
          name: template.name,
          desc: `High-quality ${template.name.toLowerCase()} perfect for your needs.`,
          slug: productId,
          categoryId: category.id,
          quantity: Math.floor(Math.random() * 100) + 10,
          price: template.price,
          discountPrice: template.discountPrice,
          status: 1,
          modifiedAt: new Date(),
        },
      });

      products.push(product);
      progress.increment();

      // Add rollback operation
      rollback.addRollback(async () => {
        await prisma.product.deleteMany({ where: { id: product.id } });
      });
    }
  }

  return products;
}

// Enhanced media creation
async function createProductMedia(
  products: any[],
  progress: SeedProgress,
  rollback: SeedRollback,
) {
  const unsplashImages = [
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
  ];

  for (const product of products) {
    const imageCount = Math.floor(Math.random() * 3) + 1; // 1-3 images per product

    for (let i = 0; i < imageCount; i++) {
      const imageUrl =
        unsplashImages[Math.floor(Math.random() * unsplashImages.length)];

      const picture = await prisma.picture.create({
        data: {
          id: randomUUID(),
          url: imageUrl,
          type: "product",
          modifiedAt: new Date(),
        },
      });

      await prisma.productPicture.create({
        data: {
          id: randomUUID(),
          pictureId: picture.id,
          productId: product.id,
          displayOrder: i,
        },
      });

      // Add rollback operation
      rollback.addRollback(async () => {
        await prisma.productPicture.deleteMany({
          where: { productId: product.id },
        });
        await prisma.picture.deleteMany({ where: { id: picture.id } });
      });
    }

    progress.increment();
  }
}

// Enhanced user creation
async function createUsers(progress: SeedProgress, rollback: SeedRollback) {
  const users = [];
  const bcrypt = await import("bcryptjs");

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      id: randomUUID(),
      email: "admin@example.com",
      name: "Admin User",
      role: "ADMIN",
      active: true,
      emailVerified: true,
      phoneNumber: "+1234567890",
    },
  });
  users.push(adminUser);
  progress.increment();

  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      id: randomUUID(),
      email: "test@example.com",
      name: "Test User",
      role: "USER",
      active: true,
      emailVerified: true,
      phoneNumber: "+1234567890",
    },
  });

  const hashedPassword = await bcrypt.hash("password", 12);
  await prisma.account.upsert({
    where: {
      providerId_accountId: {
        providerId: "credential",
        accountId: testUser.id,
      },
    },
    update: {},
    create: {
      id: randomUUID(),
      accountId: testUser.id,
      userId: testUser.id,
      providerId: "credential",
      password: hashedPassword,
    },
  });
  users.push(testUser);
  progress.increment();

  // Create additional users for testing
  for (let i = 0; i < SEED_CONFIG.usersCount - 2; i++) {
    const user = await prisma.user.upsert({
      where: { email: `user${i + 1}@example.com` },
      update: {},
      create: {
        id: randomUUID(),
        email: `user${i + 1}@example.com`,
        name: `Test User ${i + 1}`,
        role: "USER",
        active: true,
        emailVerified: Math.random() > 0.2, // 80% verified
        phoneNumber: `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      },
    });

    users.push(user);
    progress.increment();

    // Add rollback operation
    rollback.addRollback(async () => {
      await prisma.account.deleteMany({ where: { userId: user.id } });
      await prisma.user.deleteMany({ where: { id: user.id } });
    });
  }

  return users;
}

// Create reviews and ratings
async function createReviews(
  products: any[],
  users: any[],
  progress: SeedProgress,
  rollback: SeedRollback,
) {
  const reviewTemplates = [
    "Great product! Exactly as described.",
    "Excellent quality and fast shipping.",
    "Highly recommend this item.",
    "Good value for money.",
    "Satisfied with the purchase.",
    "Could be better, but overall good.",
    "Amazing product, will buy again!",
    "Perfect for my needs.",
    "Quality is outstanding.",
    "Fast delivery and great service.",
  ];

  for (const product of products) {
    const reviewCount = Math.min(SEED_CONFIG.reviewsPerProduct, users.length);

    for (let i = 0; i < reviewCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 5) + 1; // 1-5 stars
      const reviewText =
        reviewTemplates[Math.floor(Math.random() * reviewTemplates.length)];

      const review = await prisma.review.create({
        data: {
          id: randomUUID(),
          productId: product.id,
          userId: user.id,
          rating,
          comment: reviewText,
          createdAt: new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
          ), // Last 30 days
          updatedAt: new Date(),
        },
      });

      // Add rollback operation
      rollback.addRollback(async () => {
        await prisma.review.deleteMany({ where: { id: review.id } });
      });
    }

    progress.increment();
  }
}

// Create collections
async function createCollections(
  products: any[],
  progress: SeedProgress,
  rollback: SeedRollback,
) {
  const collections = [
    { name: "Featured Products", description: "Our top-rated products" },
    { name: "New Arrivals", description: "Latest additions to our store" },
    { name: "Best Sellers", description: "Most popular items" },
    { name: "On Sale", description: "Products currently on discount" },
  ];

  for (const collectionData of collections) {
    const collection = await prisma.collection.create({
      data: {
        id: randomUUID(),
        name: collectionData.name,
        description: collectionData.description,
        slug: collectionData.name.toLowerCase().replace(/\s+/g, "-"),
        isActive: true,
        sortOrder: collections.indexOf(collectionData),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Add random products to collection
    const collectionProducts = products
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 10) + 5); // 5-15 products

    for (const product of collectionProducts) {
      await prisma.collectionProduct.create({
        data: {
          id: randomUUID(),
          collectionId: collection.id,
          productId: product.id,
          displayOrder: collectionProducts.indexOf(product),
        },
      });
    }

    // Add rollback operation
    rollback.addRollback(async () => {
      await prisma.collectionProduct.deleteMany({
        where: { collectionId: collection.id },
      });
      await prisma.collection.deleteMany({ where: { id: collection.id } });
    });

    progress.increment();
  }
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
