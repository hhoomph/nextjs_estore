import { randomUUID } from "node:crypto";
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
  categoriesCount: 12,
  productsPerCategory: 5,
  usersCount: 50,
  reviewsPerProduct: 5,

  // Features
  enableRollback: true,
  enableValidation: true,
  enableProgress: true,
};

type CategorySeedData = {
  id: string;
  name: string;
  description?: string;
};

type ProductTemplate = {
  name: string;
  price: number;
  discountPrice?: number;
  categoryId: string;
};

type SeedProduct = {
  id: string;
};

type SeedCategory = {
  id: string;
};

const sampleProductImages = [
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
  "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400",
  "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400",
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400",
  "https://images.unsplash.com/photo-1526178417617-24d1387740a9?w=400",
];

function getDeterministicImageIndex(value: string, offset = 0): number {
  let hash = 0;

  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return (hash + offset) % sampleProductImages.length;
}

function getProductImageUrl(value: string, offset = 0): string {
  return sampleProductImages[getDeterministicImageIndex(value, offset)];
}

// Progress tracking
class SeedProgress {
  private total = 0;
  private completed = 0;
  private startTime = Date.now();

  setTotal(total: number) {
    this.total = total;
  }

  addTotal(total: number) {
    this.total += total;
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

    // Basic integrity checks for seeded storefront data
    const productCount = await prisma.product.count();
    if (productCount === 0) {
      issues.push(`No products found in database`);
    }

    const reviewCount = await prisma.review.count();
    if (reviewCount === 0) {
      issues.push(`No reviews found in database`);
    }

    const minimumProductImages = 2;

    const seededProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
        ogImage: true,
        productPictures: {
          select: { id: true },
        },
      },
    });

    const productsWithoutCategory = seededProducts.filter(
      (product) => !product.categoryId,
    );

    const productsWithoutOgImage = seededProducts.filter(
      (product) => !product.ogImage,
    );

    const productsWithoutImages = seededProducts.filter(
      (product) => product.productPictures.length < minimumProductImages,
    );

    if (productsWithoutCategory.length > 0) {
      issues.push(
        `${productsWithoutCategory.length} products do not have a category`,
      );
    }

    if (productsWithoutOgImage.length > 0) {
      issues.push(
        `${productsWithoutOgImage.length} products do not have an og image`,
      );
    }

    if (productsWithoutImages.length > 0) {
      issues.push(
        `${productsWithoutImages.length} products have fewer than ${minimumProductImages} product images`,
      );
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
    const productCount =
      SEED_CONFIG.categoriesCount * SEED_CONFIG.productsPerCategory;
    const totalOperations =
      SEED_CONFIG.categoriesCount +
      productCount +
      productCount +
      SEED_CONFIG.usersCount +
      productCount * SEED_CONFIG.reviewsPerProduct +
      4;

    progress.setTotal(totalOperations);

    // Create comprehensive categories
    const categories = await createCategories(progress, rollback);
    console.log(`📂 Created ${categories.length} categories`);

    // Create products for each category
    const products = await createProducts(categories, progress, rollback);
    console.log(`📦 Created or updated ${products.length} products`);

    const allProducts = await prisma.product.findMany({
      select: { id: true },
    });
    progress.addTotal(Math.max(0, allProducts.length - products.length));

    // Update product images and media
    await createProductMedia(allProducts, progress);
    console.log("🖼️ Updated product images and media");

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
  const categoriesData: CategorySeedData[] = [
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
    {
      id: "sample-products",
      name: "Sample Products",
      description: "Sample products for testing storefront flows",
    },
    {
      id: "sample-deals",
      name: "Sample Deals",
      description: "Sample discounted products for promotion flows",
    },
    {
      id: "sample-bundles",
      name: "Sample Bundles",
      description: "Sample product bundles for cart and checkout flows",
    },
    {
      id: "sample-featured",
      name: "Sample Featured",
      description: "Sample featured products for merchandising flows",
    },
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
  categories: SeedCategory[],
  progress: SeedProgress,
  rollback: SeedRollback,
) {
  const products = [];
  const productTemplates: ProductTemplate[] = [
    // Electronics
    {
      name: "Wireless Bluetooth Headphones",
      price: 99.99,
      discountPrice: 79.99,
      categoryId: "electronics",
    },
    {
      name: "Smart Fitness Watch",
      price: 249.99,
      discountPrice: 199.99,
      categoryId: "electronics",
    },
    {
      name: "4K Ultra HD Monitor",
      price: 399.99,
      discountPrice: 349.99,
      categoryId: "electronics",
    },
    {
      name: "Wireless Gaming Mouse",
      price: 79.99,
      discountPrice: 59.99,
      categoryId: "electronics",
    },
    {
      name: "Mechanical Keyboard",
      price: 149.99,
      discountPrice: 129.99,
      categoryId: "electronics",
    },

    // Fashion
    { name: "Premium Leather Jacket", price: 299.99, categoryId: "fashion" },
    {
      name: "Designer Sunglasses",
      price: 199.99,
      discountPrice: 149.99,
      categoryId: "fashion",
    },
    {
      name: "Running Sneakers",
      price: 129.99,
      discountPrice: 99.99,
      categoryId: "fashion",
    },
    {
      name: "Cotton T-Shirt",
      price: 29.99,
      discountPrice: 19.99,
      categoryId: "fashion",
    },
    {
      name: "Denim Jeans",
      price: 89.99,
      discountPrice: 69.99,
      categoryId: "fashion",
    },

    // Home & Garden
    {
      name: "Programmable Coffee Maker",
      price: 89.99,
      discountPrice: 69.99,
      categoryId: "home-garden",
    },
    {
      name: "Robot Vacuum Cleaner",
      price: 349.99,
      discountPrice: 299.99,
      categoryId: "home-garden",
    },
    {
      name: "Garden Hose Set",
      price: 49.99,
      discountPrice: 39.99,
      categoryId: "home-garden",
    },
    {
      name: "LED Desk Lamp",
      price: 79.99,
      discountPrice: 59.99,
      categoryId: "home-garden",
    },
    {
      name: "Throw Pillow Set",
      price: 34.99,
      discountPrice: 24.99,
      categoryId: "home-garden",
    },

    // Sports & Outdoors
    {
      name: "Yoga Mat Premium",
      price: 39.99,
      discountPrice: 29.99,
      categoryId: "sports",
    },
    {
      name: "Adjustable Dumbbell Set",
      price: 199.99,
      discountPrice: 149.99,
      categoryId: "sports",
    },
    {
      name: "Mountain Bike Helmet",
      price: 89.99,
      discountPrice: 69.99,
      categoryId: "sports",
    },
    {
      name: "Camping Tent 4-Person",
      price: 249.99,
      discountPrice: 199.99,
      categoryId: "sports",
    },
    {
      name: "Resistance Bands Kit",
      price: 29.99,
      discountPrice: 19.99,
      categoryId: "sports",
    },

    // Books
    {
      name: "The Art of Programming",
      price: 49.99,
      discountPrice: 39.99,
      categoryId: "books",
    },
    {
      name: "JavaScript: The Good Parts",
      price: 34.99,
      discountPrice: 24.99,
      categoryId: "books",
    },
    {
      name: "Clean Code Handbook",
      price: 44.99,
      discountPrice: 34.99,
      categoryId: "books",
    },
    {
      name: "System Design Interview",
      price: 39.99,
      discountPrice: 29.99,
      categoryId: "books",
    },
    {
      name: "Data Structures & Algorithms",
      price: 54.99,
      discountPrice: 44.99,
      categoryId: "books",
    },

    // Beauty & Personal Care
    {
      name: "Organic Face Serum",
      price: 34.99,
      discountPrice: 24.99,
      categoryId: "beauty",
    },
    {
      name: "Professional Hair Dryer",
      price: 79.99,
      discountPrice: 59.99,
      categoryId: "beauty",
    },
    {
      name: "Essential Oils Collection",
      price: 44.99,
      discountPrice: 34.99,
      categoryId: "beauty",
    },
    {
      name: "Electric Toothbrush",
      price: 69.99,
      discountPrice: 49.99,
      categoryId: "beauty",
    },
    {
      name: "Moisturizing Cream Set",
      price: 29.99,
      discountPrice: 19.99,
      categoryId: "beauty",
    },

    // Automotive
    {
      name: "Dash Cam 4K",
      price: 129.99,
      discountPrice: 99.99,
      categoryId: "automotive",
    },
    {
      name: "Car Vacuum Cleaner",
      price: 59.99,
      discountPrice: 44.99,
      categoryId: "automotive",
    },
    {
      name: "LED Interior Lights Kit",
      price: 24.99,
      discountPrice: 19.99,
      categoryId: "automotive",
    },
    {
      name: "Portable Jump Starter",
      price: 89.99,
      discountPrice: 69.99,
      categoryId: "automotive",
    },
    {
      name: "Car Phone Mount",
      price: 19.99,
      discountPrice: 14.99,
      categoryId: "automotive",
    },

    // Toys & Games
    {
      name: "Building Blocks Set 1000pc",
      price: 49.99,
      discountPrice: 39.99,
      categoryId: "toys",
    },
    {
      name: "Remote Control Car",
      price: 59.99,
      discountPrice: 44.99,
      categoryId: "toys",
    },
    {
      name: "Board Game Collection",
      price: 34.99,
      discountPrice: 24.99,
      categoryId: "toys",
    },
    {
      name: "Stuffed Animal Bear",
      price: 24.99,
      discountPrice: 19.99,
      categoryId: "toys",
    },
    {
      name: "Science Experiment Kit",
      price: 39.99,
      discountPrice: 29.99,
      categoryId: "toys",
    },

    // Sample Products
    {
      name: "Sample Starter Kit",
      price: 24.99,
      discountPrice: 19.99,
      categoryId: "sample-products",
    },
    {
      name: "Sample Demo Bundle",
      price: 39.99,
      discountPrice: 29.99,
      categoryId: "sample-products",
    },
    {
      name: "Sample Storefront Pack",
      price: 49.99,
      discountPrice: 39.99,
      categoryId: "sample-products",
    },
    {
      name: "Sample Checkout Item",
      price: 14.99,
      discountPrice: 9.99,
      categoryId: "sample-products",
    },
    {
      name: "Sample Featured Product",
      price: 59.99,
      discountPrice: 44.99,
      categoryId: "sample-products",
    },

    // Sample Deals
    {
      name: "Sample Flash Sale Item",
      price: 29.99,
      discountPrice: 14.99,
      categoryId: "sample-deals",
    },
    {
      name: "Sample Clearance Product",
      price: 34.99,
      discountPrice: 17.99,
      categoryId: "sample-deals",
    },
    {
      name: "Sample Limited Offer",
      price: 44.99,
      discountPrice: 24.99,
      categoryId: "sample-deals",
    },
    {
      name: "Sample Discount Bundle",
      price: 64.99,
      discountPrice: 39.99,
      categoryId: "sample-deals",
    },
    {
      name: "Sample Deal of the Day",
      price: 54.99,
      discountPrice: 34.99,
      categoryId: "sample-deals",
    },

    // Sample Bundles
    {
      name: "Sample Starter Bundle",
      price: 79.99,
      discountPrice: 59.99,
      categoryId: "sample-bundles",
    },
    {
      name: "Sample Family Bundle",
      price: 99.99,
      discountPrice: 79.99,
      categoryId: "sample-bundles",
    },
    {
      name: "Sample Gift Bundle",
      price: 69.99,
      discountPrice: 49.99,
      categoryId: "sample-bundles",
    },
    {
      name: "Sample Trial Bundle",
      price: 39.99,
      discountPrice: 29.99,
      categoryId: "sample-bundles",
    },
    {
      name: "Sample Premium Bundle",
      price: 119.99,
      discountPrice: 89.99,
      categoryId: "sample-bundles",
    },

    // Sample Featured
    {
      name: "Sample Featured Hero",
      price: 129.99,
      discountPrice: 99.99,
      categoryId: "sample-featured",
    },
    {
      name: "Sample Featured Bestseller",
      price: 89.99,
      discountPrice: 69.99,
      categoryId: "sample-featured",
    },
    {
      name: "Sample Featured New Arrival",
      price: 74.99,
      discountPrice: 54.99,
      categoryId: "sample-featured",
    },
    {
      name: "Sample Featured Seasonal",
      price: 64.99,
      discountPrice: 44.99,
      categoryId: "sample-featured",
    },
    {
      name: "Sample Featured Premium",
      price: 149.99,
      discountPrice: 119.99,
      categoryId: "sample-featured",
    },
  ];

  for (const category of categories) {
    const categoryProducts = productTemplates
      .filter((template) => template.categoryId === category.id)
      .slice(0, SEED_CONFIG.productsPerCategory);

    if (categoryProducts.length === 0) {
      throw new Error(`No product templates found for category ${category.id}`);
    }

    for (const template of categoryProducts) {
      const productId = `${category.id}-${template.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")}`;
      const product = await prisma.product.upsert({
        where: { id: productId },
        update: {
          name: template.name,
          desc: `High-quality ${template.name.toLowerCase()} perfect for your needs.`,
          slug: productId,
          categoryId: template.categoryId,
          quantity: Math.max(10, Math.floor(Math.random() * 100) + 10),
          price: template.price,
          discountPrice: template.discountPrice,
          ogImage: getProductImageUrl(productId, 0),
          status: 1,
          modifiedAt: new Date(),
        },
        create: {
          id: productId,
          name: template.name,
          desc: `High-quality ${template.name.toLowerCase()} perfect for your needs.`,
          slug: productId,
          categoryId: template.categoryId,
          quantity: Math.max(10, Math.floor(Math.random() * 100) + 10),
          price: template.price,
          discountPrice: template.discountPrice,
          ogImage: getProductImageUrl(productId, 0),
          status: 1,
          modifiedAt: new Date(),
        },
      });

      if (!product.categoryId) {
        throw new Error(`Product ${product.id} was created without a category`);
      }

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
  products: SeedProduct[],
  progress: SeedProgress,
) {
  const imagesPerProduct = 2;

  for (const product of products) {
    await prisma.product.update({
      where: { id: product.id },
      data: {
        ogImage: getProductImageUrl(product.id, 0),
        modifiedAt: new Date(),
      },
    });

    const existingProductPictures = await prisma.productPicture.findMany({
      where: { productId: product.id },
      select: { id: true },
    });

    if (existingProductPictures.length > 0) {
      await prisma.productPicture.deleteMany({
        where: {
          id: {
            in: existingProductPictures.map((productPicture) => productPicture.id),
          },
        },
      });
    }

    for (let i = 0; i < imagesPerProduct; i++) {
      const pictureId = `sample-picture-${product.id}-${i}`;
      const productPictureId = `sample-product-picture-${product.id}-${i}`;
      const imageUrl = getProductImageUrl(product.id, i + 1);

      await prisma.picture.upsert({
        where: { id: pictureId },
        update: {
          url: imageUrl,
          type: "product",
          modifiedAt: new Date(),
        },
        create: {
          id: pictureId,
          url: imageUrl,
          type: "product",
          modifiedAt: new Date(),
        },
      });

      await prisma.productPicture.upsert({
        where: { id: productPictureId },
        update: {
          pictureId,
          displayOrder: i,
        },
        create: {
          id: productPictureId,
          pictureId,
          productId: product.id,
          displayOrder: i,
        },
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
  products: SeedProduct[],
  users: SeedProduct[],
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
  products: SeedProduct[],
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
