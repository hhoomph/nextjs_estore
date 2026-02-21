#!/usr/bin/env tsx
/**
 * Database Seed Script - Populate with Sample Products
 * Usage: bun run scripts/seed-products.ts
 */

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("[v0] Starting database seeding...");

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log("[v0] Clearing existing data...");
    await prisma.cartItem.deleteMany({});
    await prisma.review.deleteMany({});
    await prisma.wishlist.deleteMany({});
    await prisma.recentlyViewed.deleteMany({});
    await prisma.collectionProducts.deleteMany({});
    await prisma.collection.deleteMany({});
    await prisma.productPictures.deleteMany({});
    await prisma.productOptions.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.picture.deleteMany({});
    await prisma.category.deleteMany({});

    console.log("[v0] Creating categories...");

    // Create categories
    const categoryElectronics = await prisma.category.create({
      data: {
        id: "cat_1",
        name: "Electronics",
        level: 1,
      },
    });

    const categoryFashion = await prisma.category.create({
      data: {
        id: "cat_2",
        name: "Fashion",
        level: 1,
      },
    });

    const categoryHome = await prisma.category.create({
      data: {
        id: "cat_3",
        name: "Home & Garden",
        level: 1,
      },
    });

    console.log("[v0] Creating pictures...");

    // Create pictures
    const pic1 = await prisma.picture.create({
      data: {
        id: "pic_1",
        url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    const pic2 = await prisma.picture.create({
      data: {
        id: "pic_2",
        url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    const pic3 = await prisma.picture.create({
      data: {
        id: "pic_3",
        url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    const pic4 = await prisma.picture.create({
      data: {
        id: "pic_4",
        url: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    const pic5 = await prisma.picture.create({
      data: {
        id: "pic_5",
        url: "https://images.unsplash.com/photo-1556821552-23d516c24b2d?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    const pic6 = await prisma.picture.create({
      data: {
        id: "pic_6",
        url: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    const pic7 = await prisma.picture.create({
      data: {
        id: "pic_7",
        url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    const pic8 = await prisma.picture.create({
      data: {
        id: "pic_8",
        url: "https://images.unsplash.com/photo-1525048553597-7c8b3ce3b675?w=500&h=500&fit=crop",
        type: "product",
      },
    });

    console.log("[v0] Creating products...");

    // Create products
    const products = await Promise.all([
      prisma.product.create({
        data: {
          id: "prod_1",
          name: "Wireless Headphones",
          desc: "Premium noise-cancelling wireless headphones with 30-hour battery life",
          slug: "wireless-headphones",
          categoryId: categoryElectronics.id,
          price: 199.99,
          discountPrice: 149.99,
          quantity: 50,
          status: 1,
          seoTitle: "Wireless Headphones - Premium Audio",
          seoDescription: "Shop high-quality wireless headphones with noise cancellation",
          seoKeywords: "headphones, wireless, audio, noise-cancelling",
        },
      }),

      prisma.product.create({
        data: {
          id: "prod_2",
          name: "Smart Watch",
          desc: "Feature-rich smartwatch with heart rate monitor and sleep tracking",
          slug: "smart-watch",
          categoryId: categoryElectronics.id,
          price: 299.99,
          quantity: 35,
          status: 1,
          seoTitle: "Smart Watch - Health & Fitness Tracking",
          seoDescription: "Advanced smartwatch for health monitoring and notifications",
          seoKeywords: "smartwatch, fitness, health, wearable",
        },
      }),

      prisma.product.create({
        data: {
          id: "prod_3",
          name: "Casual T-Shirt",
          desc: "Comfortable cotton t-shirt available in multiple colors",
          slug: "casual-tshirt",
          categoryId: categoryFashion.id,
          price: 29.99,
          discountPrice: 19.99,
          quantity: 100,
          status: 1,
          seoTitle: "Casual T-Shirt - Comfortable Fashion",
          seoDescription: "High-quality casual t-shirts for everyday wear",
          seoKeywords: "t-shirt, casual, fashion, clothing",
        },
      }),

      prisma.product.create({
        data: {
          id: "prod_4",
          name: "Winter Jacket",
          desc: "Warm and stylish winter jacket with water-resistant fabric",
          slug: "winter-jacket",
          categoryId: categoryFashion.id,
          price: 129.99,
          quantity: 25,
          status: 1,
          seoTitle: "Winter Jacket - Warm Fashion",
          seoDescription: "Stylish winter jackets with water resistance",
          seoKeywords: "jacket, winter, fashion, warm",
        },
      }),

      prisma.product.create({
        data: {
          id: "prod_5",
          name: "Coffee Maker",
          desc: "Programmable coffee maker with thermal carafe, makes up to 12 cups",
          slug: "coffee-maker",
          categoryId: categoryHome.id,
          price: 79.99,
          discountPrice: 59.99,
          quantity: 40,
          status: 1,
          seoTitle: "Coffee Maker - Home Kitchen",
          seoDescription: "Programmable coffee makers for your home",
          seoKeywords: "coffee maker, kitchen, home, appliance",
        },
      }),

      prisma.product.create({
        data: {
          id: "prod_6",
          name: "Bedding Set",
          desc: "Luxurious 4-piece bedding set with Egyptian cotton sheets",
          slug: "bedding-set",
          categoryId: categoryHome.id,
          price: 149.99,
          quantity: 30,
          status: 1,
          seoTitle: "Bedding Set - Home Comfort",
          seoDescription: "Premium Egyptian cotton bedding sets",
          seoKeywords: "bedding, sheets, home, bedroom",
        },
      }),

      prisma.product.create({
        data: {
          id: "prod_7",
          name: "USB-C Cable",
          desc: "High-speed USB-C charging and data transfer cable, 6ft length",
          slug: "usb-c-cable",
          categoryId: categoryElectronics.id,
          price: 12.99,
          quantity: 200,
          status: 1,
          seoTitle: "USB-C Cable - Fast Charging",
          seoDescription: "Fast charging USB-C cables for your devices",
          seoKeywords: "usb-c, cable, charging, fast",
        },
      }),

      prisma.product.create({
        data: {
          id: "prod_8",
          name: "Running Shoes",
          desc: "Professional running shoes with cushioned sole and breathable mesh",
          slug: "running-shoes",
          categoryId: categoryFashion.id,
          price: 109.99,
          discountPrice: 89.99,
          quantity: 60,
          status: 1,
          seoTitle: "Running Shoes - Sports Footwear",
          seoDescription: "Professional running shoes for athletes",
          seoKeywords: "running shoes, sports, athletic, footwear",
        },
      }),
    ]);

    console.log("[v0] Creating product pictures...");

    // Link pictures to products
    await Promise.all([
      prisma.productPictures.create({
        data: {
          id: "pp_1",
          productId: products[0].id,
          pictureId: pic1.id,
          displayOrder: 0,
        },
      }),
      prisma.productPictures.create({
        data: {
          id: "pp_2",
          productId: products[1].id,
          pictureId: pic2.id,
          displayOrder: 0,
        },
      }),
      prisma.productPictures.create({
        data: {
          id: "pp_3",
          productId: products[2].id,
          pictureId: pic3.id,
          displayOrder: 0,
        },
      }),
      prisma.productPictures.create({
        data: {
          id: "pp_4",
          productId: products[3].id,
          pictureId: pic4.id,
          displayOrder: 0,
        },
      }),
      prisma.productPictures.create({
        data: {
          id: "pp_5",
          productId: products[4].id,
          pictureId: pic5.id,
          displayOrder: 0,
        },
      }),
      prisma.productPictures.create({
        data: {
          id: "pp_6",
          productId: products[5].id,
          pictureId: pic6.id,
          displayOrder: 0,
        },
      }),
      prisma.productPictures.create({
        data: {
          id: "pp_7",
          productId: products[6].id,
          pictureId: pic7.id,
          displayOrder: 0,
        },
      }),
      prisma.productPictures.create({
        data: {
          id: "pp_8",
          productId: products[7].id,
          pictureId: pic8.id,
          displayOrder: 0,
        },
      }),
    ]);

    console.log("[v0] ✅ Database seeding completed successfully!");
    console.log(`[v0] Created ${products.length} products with images`);
    console.log("[v0] Created 3 categories");
  } catch (error) {
    console.error("[v0] ❌ Seeding failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
