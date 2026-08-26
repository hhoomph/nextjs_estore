-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('draft', 'published', 'archived');

-- CreateEnum
CREATE TYPE "BlogCommentStatus" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "address" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "blog_comment" DROP COLUMN "status",
ADD COLUMN     "status" "BlogCommentStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "blog_post" ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "BlogPostStatus" NOT NULL DEFAULT 'draft';

-- AlterTable
ALTER TABLE "category" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "option_group" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "options" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "order" ADD COLUMN     "deletedAt" TIMESTAMP(3),
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "product" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "product_options" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "review" DROP COLUMN "status",
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "blog_comment_status_idx" ON "blog_comment"("status");

-- CreateIndex
CREATE INDEX "blog_comment_postId_status_idx" ON "blog_comment"("postId", "status");

-- CreateIndex
CREATE INDEX "blog_post_status_idx" ON "blog_post"("status");

-- CreateIndex
CREATE INDEX "blog_post_status_publishedAt_idx" ON "blog_post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "blog_post_authorId_status_idx" ON "blog_post"("authorId", "status");

-- CreateIndex
CREATE INDEX "blog_post_categoryId_status_idx" ON "blog_post"("categoryId", "status");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_userId_status_idx" ON "order"("userId", "status");

-- CreateIndex
CREATE INDEX "order_status_createdAt_idx" ON "order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "review_status_idx" ON "review"("status");

-- CreateIndex
CREATE INDEX "review_productId_status_idx" ON "review"("productId", "status");
