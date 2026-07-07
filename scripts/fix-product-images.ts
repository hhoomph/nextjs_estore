/**
 * Script to fix missing product images in the database.
 *
 * Scans all products and assigns placeholder images to any that
 * are missing both productPictures and ogImage.
 *
 * @author hh.oomph@gmail.com
 * @version 1.0.0
 * @since 2025-01-01
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../app/generated/prisma/client";
import "dotenv/config";
import {
  PLACEHOLDER_IMAGE,
  getProductImageUrl,
} from "../lib/utils/image-utils";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

interface ProductWithImages {
  id: string;
  name: string | null;
  ogImage: string | null;
  productPictures: Array<{ id: string }>;
}

async function fixProductImages() {
  console.log("🔍 Scanning products for missing images...\n");

  try {
    // Find products without any images
    const products = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        ogImage: true,
        productPictures: {
          select: { id: true },
        },
      },
    });

    const productsWithoutOgImage = products.filter(
      (p: ProductWithImages) => !p.ogImage,
    );
    const productsWithoutPictures = products.filter(
      (p: ProductWithImages) => p.productPictures.length === 0,
    );
    const productsWithoutAnyImage = products.filter(
      (p: ProductWithImages) =>
        !p.ogImage && p.productPictures.length === 0,
    );

    console.log(`📊 Total products: ${products.length}`);
    console.log(`📊 Products without ogImage: ${productsWithoutOgImage.length}`);
    console.log(`📊 Products without productPictures: ${productsWithoutPictures.length}`);
    console.log(`📊 Products with NO images at all: ${productsWithoutAnyImage.length}\n`);

    // Fix 1: Assign ogImage to products missing it
    if (productsWithoutOgImage.length > 0) {
      console.log(`🖼️  Assigning ogImage to ${productsWithoutOgImage.length} products...`);
      for (const product of productsWithoutOgImage) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            ogImage: getProductImageUrl(product.id, 0),
            modifiedAt: new Date(),
          },
        });
      }
      console.log(`✅ Assigned ogImage to ${productsWithoutOgImage.length} products\n`);
    }

    // Fix 2: Create productPictures for products missing them
    if (productsWithoutPictures.length > 0) {
      console.log(`🖼️  Creating productPictures for ${productsWithoutPictures.length} products...`);
      for (const product of productsWithoutPictures) {
        const imageUrl = getProductImageUrl(product.id, 0);

        // Create a picture record
        const pictureId = `fix-picture-${product.id}-0`;
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

        // Link picture to product
        const productPictureId = `fix-product-picture-${product.id}-0`;
        await prisma.productPicture.upsert({
          where: { id: productPictureId },
          update: {
            pictureId,
            displayOrder: 0,
          },
          create: {
            id: productPictureId,
            pictureId,
            productId: product.id,
            displayOrder: 0,
          },
        });
      }
      console.log(`✅ Created productPictures for ${productsWithoutPictures.length} products\n`);
    }

    // Summary
    if (productsWithoutAnyImage.length === 0 && productsWithoutOgImage.length === 0 && productsWithoutPictures.length === 0) {
      console.log("✅ All products already have valid images. Nothing to fix.\n");
    } else {
      console.log("✅ Image fix complete!\n");
      console.log("📋 Summary:");
      console.log(`   - Products fixed (ogImage): ${productsWithoutOgImage.length}`);
      console.log(`   - Products fixed (pictures): ${productsWithoutPictures.length}`);
      console.log(`   - Products with zero images before fix: ${productsWithoutAnyImage.length}`);
    }

    // Verify
    const fixedProducts = await prisma.product.findMany({
      select: {
        id: true,
        name: true,
        ogImage: true,
        productPictures: {
          select: { id: true },
        },
      },
    });

    const stillMissing = fixedProducts.filter(
      (p: ProductWithImages) => !p.ogImage && p.productPictures.length === 0,
    );

    if (stillMissing.length > 0) {
      console.warn(`\n⚠️  ${stillMissing.length} products still have no images:`);
      stillMissing.forEach((p: ProductWithImages) => console.warn(`   - ${p.id} (${p.name || "unnamed"})`));
    } else {
      console.log("\n✅ All products now have valid images!");
    }

  } catch (error) {
    console.error("❌ Error fixing product images:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixProductImages();