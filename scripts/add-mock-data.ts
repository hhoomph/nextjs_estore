/**
 * Additional mock data seeding script for orders and blog content
 * Run with: bun run scripts/add-mock-data.ts
 */
import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import "dotenv/config";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function createOrders() {
  console.log("📦 Creating orders...");

  // Get all users and products
  const users = await prisma.user.findMany({ take: 10 });
  const products = await prisma.product.findMany();

  if (products.length === 0) {
    console.log("⚠️ No products found. Run seed.ts first.");
    return;
  }

  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  for (let i = 0; i < 20; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const orderProducts = products
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    let total = 0;
    for (const p of orderProducts) {
      total += Number(p.price);
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const createdAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    );

    const order = await prisma.order.create({
      data: {
        id: randomUUID(),
        userId: user?.id || null,
        total,
        status,
        createdAt,
        modifiedAt: new Date(),
      },
    });

    // Create order items
    for (const product of orderProducts) {
      await prisma.orderItem.create({
        data: {
          id: randomUUID(),
          orderId: order.id,
          productId: product.id,
          quantity: Math.floor(Math.random() * 3) + 1,
          createdAt,
          modifiedAt: new Date(),
        },
      });
    }

    // Create payment if not cancelled
    if (status !== "cancelled") {
      await prisma.payment.create({
        data: {
          id: randomUUID(),
          userId: user?.id || null,
          orderId: order.id,
          amount: total,
          provider: "credit_card",
          status: "completed",
          transactionCode: `TXN${randomUUID().slice(0, 8)}`,
          createdAt,
          modifiedAt: new Date(),
        },
      });
    }
  }

  console.log("✅ Created 20 orders with items and payments");
}

async function createBlogData() {
  console.log("📝 Creating blog data...");

  // Get admin user
  const admin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!admin) {
    console.log("⚠️ No admin user found. Run seed.ts first.");
    return;
  }

  // Create blog categories
  const blogCategories = [
    { name: "Technology", slug: "technology", color: "#3b82f6", icon: "laptop" },
    { name: "Business", slug: "business", color: "#10b981", icon: "briefcase" },
    { name: "Lifestyle", slug: "lifestyle", color: "#f59e0b", icon: "heart" },
    { name: "Tutorials", slug: "tutorials", color: "#8b5cf6", icon: "book" },
  ];

  const createdCategories = [];
  for (const cat of blogCategories) {
    const category = await prisma.blogCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        id: randomUUID(),
        name: cat.name,
        slug: cat.slug,
        color: cat.color,
        icon: cat.icon,
        active: true,
        order: blogCategories.indexOf(cat),
      },
    });
    createdCategories.push(category);
  }

  console.log(`✅ Created ${createdCategories.length} blog categories`);

  // Create blog tags
  const blogTags = [
    { name: "JavaScript", slug: "javascript", color: "#f7df1e" },
    { name: "React", slug: "react", color: "#61dafb" },
    { name: "Next.js", slug: "nextjs", color: "#000000" },
    { name: "TypeScript", slug: "typescript", color: "#3178c6" },
    { name: "Tutorial", slug: "tutorial", color: "#10b981" },
    { name: "Tips", slug: "tips", color: "#f59e0b" },
  ];

  const createdTags = [];
  for (const tag of blogTags) {
    const created = await prisma.blogTag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: {
        id: randomUUID(),
        name: tag.name,
        slug: tag.slug,
        color: tag.color,
      },
    });
    createdTags.push(created);
  }

  console.log(`✅ Created ${createdTags.length} blog tags`);

  // Create blog posts
  const blogPosts = [
    {
      title: "Getting Started with Next.js 15",
      slug: "getting-started-nextjs-15",
      excerpt: "Learn how to build modern web applications with Next.js 15",
      content: "Next.js 15 brings many new features...",
      status: "published",
    },
    {
      title: "Building E-commerce Stores with Prisma",
      slug: "building-ecommerce-prisma",
      excerpt: "A comprehensive guide to building e-commerce with Prisma ORM",
      content: "Prisma makes database operations easy...",
      status: "published",
    },
    {
      title: "Best Practices for TypeScript",
      slug: "best-practices-typescript",
      excerpt: "Improve your TypeScript code with these best practices",
      content: "TypeScript is powerful when used correctly...",
      status: "published",
    },
    {
      title: "Understanding React Server Components",
      slug: "understanding-rsc",
      excerpt: "Deep dive into React Server Components",
      content: "React Server Components change how we build React apps...",
      status: "published",
    },
    {
      title: "Introduction to Tailwind CSS 4",
      slug: "intro-tailwind-4",
      excerpt: "What's new in Tailwind CSS 4",
      content: "Tailwind CSS 4 introduces CSS-first configuration...",
      status: "draft",
    },
  ];

  for (const post of blogPosts) {
    const category =
      createdCategories[Math.floor(Math.random() * createdCategories.length)];

    const createdPost = await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        id: randomUUID(),
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content + " ".repeat(500), // Make content longer
        status: post.status,
        publishedAt: post.status === "published" ? new Date() : null,
        authorId: admin.id,
        categoryId: category.id,
        readingTime: Math.floor(Math.random() * 10) + 3,
        viewCount: Math.floor(Math.random() * 1000),
      },
    });

    // Add random tags to post
    const selectedTags = createdTags
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 3) + 1);

    for (const tag of selectedTags) {
      await prisma.blogPostTag.upsert({
        where: {
          postId_tagId: {
            postId: createdPost.id,
            tagId: tag.id,
          },
        },
        update: {},
        create: {
          id: randomUUID(),
          postId: createdPost.id,
          tagId: tag.id,
        },
      });
    }

    // Create some comments for published posts
    if (post.status === "published") {
      const users = await prisma.user.findMany({ take: 5 });

      for (let i = 0; i < Math.floor(Math.random() * 5) + 1; i++) {
        const user = users[Math.floor(Math.random() * users.length)];

        await prisma.blogComment.create({
          data: {
            id: randomUUID(),
            content: "Great article! Thanks for sharing.",
            authorId: user.id,
            postId: createdPost.id,
            status: "approved",
          },
        });
      }
    }
  }

  console.log(`✅ Created ${blogPosts.length} blog posts with tags and comments`);
}

async function createSiteSettings() {
  console.log("⚙️ Creating site settings...");

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      siteTitleEn: "NextJS E-Store",
      siteTitleFa: "فروشگاه نکست جی اس",
      phoneEn: "+1 234 567 8900",
      phoneFa: "+98 912 345 6789",
      descriptionEn: "Your one-stop shop for electronics and more",
      descriptionFa: "فروشگاه جامع الکترونیک و لوازم جانبی",
      languageMode: "multilingual",
      defaultLanguage: "fa",
      defaultCurrency: "USD",
    },
  });

  console.log("✅ Created site settings");
}

async function main() {
  try {
    console.log("🌱 Starting additional mock data seeding...\n");

    await createOrders();
    await createBlogData();
    await createSiteSettings();

    console.log("\n✅ Additional mock data seeded successfully!");

    // Display summary
    const [orderCount, productCount, userCount, postCount, categoryCount] =
      await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.user.count(),
        prisma.blogPost.count(),
        prisma.blogCategory.count(),
      ]);

    console.log("\n📊 Database Summary:");
    console.log(`   Users: ${userCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Orders: ${orderCount}`);
    console.log(`   Blog Categories: ${categoryCount}`);
    console.log(`   Blog Posts: ${postCount}`);
  } catch (error) {
    console.error("❌ Error seeding additional data:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
