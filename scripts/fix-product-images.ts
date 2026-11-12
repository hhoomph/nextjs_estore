/**
 * Verifies that every product in the catalog has real imagery.
 *
 * The storefront no longer generates placeholder images: photography is curated
 * into public/products by scripts/fetch-product-images.ts and attached by
 * scripts/seed.ts. This script reports products that are missing images so a
 * broken seed or import is caught before it reaches customers.
 *
 * Usage: bun run scripts/fix-product-images.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/client";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    select: {
      id: true,
      name: true,
      ogImage: true,
      productPictures: {
        select: { picture: { select: { url: true } } },
        orderBy: { displayOrder: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const withoutOgImage = products.filter((product) => !product.ogImage);
  const withoutPictures = products.filter((product) => product.productPictures.length === 0);
  const withoutAnyImage = products.filter(
    (product) => !product.ogImage && product.productPictures.length === 0,
  );

  console.log(`Products: ${products.length}`);
  console.log(`Missing ogImage: ${withoutOgImage.length}`);
  console.log(`Missing gallery images: ${withoutPictures.length}`);
  console.log(`Missing all imagery: ${withoutAnyImage.length}`);

  if (withoutAnyImage.length > 0) {
    console.error("\nProducts without imagery:");
    for (const product of withoutAnyImage) {
      console.error(` - ${product.id} (${product.name ?? "unnamed"})`);
    }
    console.error("\nRun `bun run scripts/fetch-product-images.ts` then `bun run scripts/seed.ts`.");
    process.exitCode = 1;
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect().catch(() => undefined);
  process.exit(1);
});
