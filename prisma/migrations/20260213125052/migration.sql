/*
  Warnings:

  - The primary key for the `account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `address_line1` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `address_line2` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `postal_code` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `address` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `product_options_id` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `cart_item` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `parent_id` on the `category` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `discount` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `discount` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `discount` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `discount` table. All the data in the column will be lost.
  - You are about to drop the column `option_group_id` on the `options` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `deliver_date` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `discount_id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `payment_id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `session_id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `order` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `Bank_Refrence` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `order_id` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_code` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `use_id` on the `payment` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `picture` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `picture` table. All the data in the column will be lost.
  - You are about to drop the column `category_id` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `discount_price` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `modified_at` on the `product` table. All the data in the column will be lost.
  - You are about to drop the column `option_group_id` on the `product_options` table. All the data in the column will be lost.
  - You are about to drop the column `options_id` on the `product_options` table. All the data in the column will be lost.
  - You are about to drop the column `price_increment` on the `product_options` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `product_options` table. All the data in the column will be lost.
  - You are about to drop the column `quantity ` on the `product_options` table. All the data in the column will be lost.
  - You are about to drop the column `display_order` on the `product_pictures` table. All the data in the column will be lost.
  - You are about to drop the column `picture_id` on the `product_pictures` table. All the data in the column will be lost.
  - You are about to drop the column `product_id` on the `product_pictures` table. All the data in the column will be lost.
  - You are about to drop the column `expires` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `sessionToken` on the `session` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `picture` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `user` table. All the data in the column will be lost.
  - The `emailVerified` column on the `user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `product` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `account` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Added the required column `updatedAt` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `cart_item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `discount` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionGroupId` to the `options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `order_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `picture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `modifiedAt` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `optionsId` to the `product_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `product_options` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pictureId` to the `product_pictures` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productId` to the `product_pictures` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "address" DROP CONSTRAINT "address_user_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_product_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_session_id_fkey";

-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_user_id_fkey";

-- DropForeignKey
ALTER TABLE "options" DROP CONSTRAINT "options_option_group_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_session_id_fkey";

-- DropForeignKey
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_product_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_order_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_use_id_fkey";

-- DropForeignKey
ALTER TABLE "product_options" DROP CONSTRAINT "product_options_option_group_id_fkey";

-- DropForeignKey
ALTER TABLE "product_options" DROP CONSTRAINT "product_options_options_id_fkey";

-- DropForeignKey
ALTER TABLE "product_options" DROP CONSTRAINT "product_options_product_id_fkey";

-- DropForeignKey
ALTER TABLE "product_pictures" DROP CONSTRAINT "product_pictures_picture_id_fkey";

-- DropForeignKey
ALTER TABLE "product_pictures" DROP CONSTRAINT "product_pictures_product_id_fkey";

-- DropIndex
DROP INDEX "session_sessionToken_key";

-- AlterTable
ALTER TABLE "account" DROP CONSTRAINT "account_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "scope" TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP,
ADD CONSTRAINT "account_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "address" DROP COLUMN "address_line1",
DROP COLUMN "address_line2",
DROP COLUMN "postal_code",
DROP COLUMN "user_id",
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "postalCode" VARCHAR(10),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "cart_item" DROP COLUMN "created_at",
DROP COLUMN "modified_at",
DROP COLUMN "product_id",
DROP COLUMN "product_options_id",
DROP COLUMN "session_id",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedAt" TIMESTAMP(3),
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "productOptionsId" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "category" DROP COLUMN "created_at",
DROP COLUMN "modified_at",
DROP COLUMN "parent_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "parentId" TEXT;

-- AlterTable
ALTER TABLE "discount" DROP COLUMN "created_at",
DROP COLUMN "end_date",
DROP COLUMN "modified_at",
DROP COLUMN "start_date",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMPTZ(6),
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMPTZ(6);

-- AlterTable
ALTER TABLE "options" DROP COLUMN "option_group_id",
ADD COLUMN     "optionGroupId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "order" DROP COLUMN "created_at",
DROP COLUMN "deliver_date",
DROP COLUMN "discount_id",
DROP COLUMN "modified_at",
DROP COLUMN "payment_id",
DROP COLUMN "session_id",
DROP COLUMN "user_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deliverDate" TIMESTAMPTZ(6),
ADD COLUMN     "discountId" TEXT,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "paymentId" TEXT,
ADD COLUMN     "sessionId" TEXT,
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "created_at",
DROP COLUMN "modified_at",
DROP COLUMN "order_id",
DROP COLUMN "product_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payment" DROP COLUMN "Bank_Refrence",
DROP COLUMN "created_at",
DROP COLUMN "modified_at",
DROP COLUMN "order_id",
DROP COLUMN "transaction_code",
DROP COLUMN "use_id",
ADD COLUMN     "bankReference" VARCHAR(255),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "transactionCode" VARCHAR(255),
ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "picture" DROP COLUMN "created_at",
DROP COLUMN "modified_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "product" DROP COLUMN "category_id",
DROP COLUMN "created_at",
DROP COLUMN "discount_price",
DROP COLUMN "modified_at",
ADD COLUMN     "canonicalUrl" TEXT,
ADD COLUMN     "categoryId" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "discountPrice" DECIMAL,
ADD COLUMN     "modifiedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ogImage" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoKeywords" TEXT,
ADD COLUMN     "seoTitle" VARCHAR(255),
ALTER COLUMN "quantity" SET DEFAULT 0,
ALTER COLUMN "status" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "product_options" DROP COLUMN "option_group_id",
DROP COLUMN "options_id",
DROP COLUMN "price_increment",
DROP COLUMN "product_id",
DROP COLUMN "quantity ",
ADD COLUMN     "optionGroupId" TEXT,
ADD COLUMN     "optionsId" TEXT NOT NULL,
ADD COLUMN     "priceIncrement" DECIMAL,
ADD COLUMN     "productId" TEXT NOT NULL,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "product_pictures" DROP COLUMN "display_order",
DROP COLUMN "picture_id",
DROP COLUMN "product_id",
ADD COLUMN     "displayOrder" SMALLINT NOT NULL DEFAULT 0,
ADD COLUMN     "pictureId" TEXT NOT NULL,
ADD COLUMN     "productId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "session" DROP COLUMN "expires",
DROP COLUMN "sessionToken",
ADD COLUMN     "impersonatedBy" TEXT,
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "created_at",
DROP COLUMN "picture",
DROP COLUMN "updated_at",
ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN DEFAULT false,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "phoneNumberVerified" BOOLEAN DEFAULT false,
ALTER COLUMN "phone_number" SET DATA TYPE TEXT,
DROP COLUMN "emailVerified",
ADD COLUMN     "emailVerified" BOOLEAN DEFAULT false;

-- AlterTable
ALTER TABLE "verification" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "title" VARCHAR(255),
    "comment" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recently_viewed" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "productId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "recently_viewed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "siteTitleEn" VARCHAR(255),
    "siteTitleFa" VARCHAR(255),
    "phoneEn" VARCHAR(50),
    "phoneFa" VARCHAR(50),
    "descriptionEn" TEXT,
    "descriptionFa" TEXT,
    "languageMode" VARCHAR(20) NOT NULL DEFAULT 'multilingual',
    "defaultLanguage" VARCHAR(5) NOT NULL DEFAULT 'fa',
    "enableProductSuggestions" BOOLEAN NOT NULL DEFAULT true,
    "suggestionAlgorithm" VARCHAR(20) NOT NULL DEFAULT 'hybrid',
    "maxSuggestions" INTEGER NOT NULL DEFAULT 6,
    "primaryColorLight" VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
    "secondaryColorLight" VARCHAR(7) NOT NULL DEFAULT '#78716c',
    "accentColorLight" VARCHAR(7) NOT NULL DEFAULT '#10b981',
    "backgroundColorLight" VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    "foregroundColorLight" VARCHAR(7) NOT NULL DEFAULT '#171717',
    "primaryColorDark" VARCHAR(7) NOT NULL DEFAULT '#60a5fa',
    "secondaryColorDark" VARCHAR(7) NOT NULL DEFAULT '#a8a29e',
    "accentColorDark" VARCHAR(7) NOT NULL DEFAULT '#10b981',
    "backgroundColorDark" VARCHAR(7) NOT NULL DEFAULT '#0a0a0a',
    "foregroundColorDark" VARCHAR(7) NOT NULL DEFAULT '#fafafa',
    "defaultSeoTitle" VARCHAR(255),
    "defaultSeoDescription" TEXT,
    "defaultOgImage" TEXT,
    "googleAnalyticsId" VARCHAR(50),
    "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
    "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
    "defaultCurrency" VARCHAR(10) NOT NULL DEFAULT 'USD',
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_category" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "color" VARCHAR(7),
    "icon" VARCHAR(50),
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_tag" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blog_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "featuredImage" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "seoTitle" VARCHAR(255),
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "readingTime" INTEGER DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_post_tag" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "blog_post_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "parentId" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "seoTitle" VARCHAR(255),
    "seoDescription" TEXT,
    "seoKeywords" TEXT,
    "ogImage" TEXT,
    "canonicalUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_product" (
    "id" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "collection_product_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_productId_idx" ON "review"("productId");

-- CreateIndex
CREATE INDEX "review_userId_idx" ON "review"("userId");

-- CreateIndex
CREATE INDEX "review_rating_idx" ON "review"("rating");

-- CreateIndex
CREATE INDEX "review_status_idx" ON "review"("status");

-- CreateIndex
CREATE INDEX "review_createdAt_idx" ON "review"("createdAt");

-- CreateIndex
CREATE INDEX "review_productId_createdAt_idx" ON "review"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "review_productId_rating_idx" ON "review"("productId", "rating");

-- CreateIndex
CREATE INDEX "review_productId_status_idx" ON "review"("productId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_userId_productId_key" ON "wishlist"("userId", "productId");

-- CreateIndex
CREATE INDEX "recently_viewed_userId_idx" ON "recently_viewed"("userId");

-- CreateIndex
CREATE INDEX "recently_viewed_sessionId_idx" ON "recently_viewed"("sessionId");

-- CreateIndex
CREATE INDEX "recently_viewed_productId_idx" ON "recently_viewed"("productId");

-- CreateIndex
CREATE INDEX "recently_viewed_viewedAt_idx" ON "recently_viewed"("viewedAt");

-- CreateIndex
CREATE INDEX "recently_viewed_userId_viewedAt_idx" ON "recently_viewed"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "recently_viewed_sessionId_viewedAt_idx" ON "recently_viewed"("sessionId", "viewedAt");

-- CreateIndex
CREATE UNIQUE INDEX "blog_category_slug_key" ON "blog_category"("slug");

-- CreateIndex
CREATE INDEX "blog_category_slug_idx" ON "blog_category"("slug");

-- CreateIndex
CREATE INDEX "blog_category_order_idx" ON "blog_category"("order");

-- CreateIndex
CREATE INDEX "blog_category_active_idx" ON "blog_category"("active");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tag_name_key" ON "blog_tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "blog_tag_slug_key" ON "blog_tag"("slug");

-- CreateIndex
CREATE INDEX "blog_tag_slug_idx" ON "blog_tag"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_slug_key" ON "blog_post"("slug");

-- CreateIndex
CREATE INDEX "blog_post_slug_idx" ON "blog_post"("slug");

-- CreateIndex
CREATE INDEX "blog_post_status_idx" ON "blog_post"("status");

-- CreateIndex
CREATE INDEX "blog_post_publishedAt_idx" ON "blog_post"("publishedAt");

-- CreateIndex
CREATE INDEX "blog_post_authorId_idx" ON "blog_post"("authorId");

-- CreateIndex
CREATE INDEX "blog_post_categoryId_idx" ON "blog_post"("categoryId");

-- CreateIndex
CREATE INDEX "blog_post_status_publishedAt_idx" ON "blog_post"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "blog_post_authorId_status_idx" ON "blog_post"("authorId", "status");

-- CreateIndex
CREATE INDEX "blog_post_categoryId_status_idx" ON "blog_post"("categoryId", "status");

-- CreateIndex
CREATE INDEX "blog_post_tag_postId_idx" ON "blog_post_tag"("postId");

-- CreateIndex
CREATE INDEX "blog_post_tag_tagId_idx" ON "blog_post_tag"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_post_tag_postId_tagId_key" ON "blog_post_tag"("postId", "tagId");

-- CreateIndex
CREATE INDEX "blog_comment_postId_idx" ON "blog_comment"("postId");

-- CreateIndex
CREATE INDEX "blog_comment_authorId_idx" ON "blog_comment"("authorId");

-- CreateIndex
CREATE INDEX "blog_comment_parentId_idx" ON "blog_comment"("parentId");

-- CreateIndex
CREATE INDEX "blog_comment_status_idx" ON "blog_comment"("status");

-- CreateIndex
CREATE INDEX "blog_comment_postId_status_idx" ON "blog_comment"("postId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "collection_slug_key" ON "collection"("slug");

-- CreateIndex
CREATE INDEX "collection_slug_idx" ON "collection"("slug");

-- CreateIndex
CREATE INDEX "collection_isActive_idx" ON "collection"("isActive");

-- CreateIndex
CREATE INDEX "collection_isFeatured_idx" ON "collection"("isFeatured");

-- CreateIndex
CREATE INDEX "collection_sortOrder_idx" ON "collection"("sortOrder");

-- CreateIndex
CREATE INDEX "collection_isActive_sortOrder_idx" ON "collection"("isActive", "sortOrder");

-- CreateIndex
CREATE INDEX "collection_isFeatured_sortOrder_idx" ON "collection"("isFeatured", "sortOrder");

-- CreateIndex
CREATE INDEX "collection_product_collectionId_idx" ON "collection_product"("collectionId");

-- CreateIndex
CREATE INDEX "collection_product_productId_idx" ON "collection_product"("productId");

-- CreateIndex
CREATE INDEX "collection_product_collectionId_displayOrder_idx" ON "collection_product"("collectionId", "displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "collection_product_collectionId_productId_key" ON "collection_product"("collectionId", "productId");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_idx" ON "PasswordResetToken"("email");

-- CreateIndex
CREATE INDEX "PasswordResetToken_expires_idx" ON "PasswordResetToken"("expires");

-- CreateIndex
CREATE INDEX "PasswordResetToken_email_expires_idx" ON "PasswordResetToken"("email", "expires");

-- CreateIndex
CREATE INDEX "account_userId_idx" ON "account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "account_providerId_accountId_key" ON "account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "address_userId_idx" ON "address"("userId");

-- CreateIndex
CREATE INDEX "address_userId_isDefault_idx" ON "address"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "cart_item_userId_idx" ON "cart_item"("userId");

-- CreateIndex
CREATE INDEX "cart_item_sessionId_idx" ON "cart_item"("sessionId");

-- CreateIndex
CREATE INDEX "cart_item_productId_idx" ON "cart_item"("productId");

-- CreateIndex
CREATE INDEX "cart_item_userId_createdAt_idx" ON "cart_item"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "category_parentId_idx" ON "category"("parentId");

-- CreateIndex
CREATE INDEX "category_level_idx" ON "category"("level");

-- CreateIndex
CREATE INDEX "category_name_idx" ON "category"("name");

-- CreateIndex
CREATE INDEX "order_userId_idx" ON "order"("userId");

-- CreateIndex
CREATE INDEX "order_status_idx" ON "order"("status");

-- CreateIndex
CREATE INDEX "order_createdAt_idx" ON "order"("createdAt");

-- CreateIndex
CREATE INDEX "order_userId_status_idx" ON "order"("userId", "status");

-- CreateIndex
CREATE INDEX "order_userId_createdAt_idx" ON "order"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "order_status_createdAt_idx" ON "order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "product_categoryId_idx" ON "product"("categoryId");

-- CreateIndex
CREATE INDEX "product_status_idx" ON "product"("status");

-- CreateIndex
CREATE INDEX "product_quantity_idx" ON "product"("quantity");

-- CreateIndex
CREATE INDEX "product_price_idx" ON "product"("price");

-- CreateIndex
CREATE INDEX "product_createdAt_idx" ON "product"("createdAt");

-- CreateIndex
CREATE INDEX "product_name_idx" ON "product"("name");

-- CreateIndex
CREATE INDEX "product_slug_idx" ON "product"("slug");

-- CreateIndex
CREATE INDEX "product_categoryId_status_idx" ON "product"("categoryId", "status");

-- CreateIndex
CREATE INDEX "product_categoryId_price_idx" ON "product"("categoryId", "price");

-- CreateIndex
CREATE INDEX "product_status_createdAt_idx" ON "product"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "product_slug_key" ON "product"("slug");

-- CreateIndex
CREATE INDEX "session_userId_idx" ON "session"("userId");

-- CreateIndex
CREATE INDEX "verification_identifier_idx" ON "verification"("identifier");

-- AddForeignKey
ALTER TABLE "address" ADD CONSTRAINT "address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_item" ADD CONSTRAINT "cart_item_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "options" ADD CONSTRAINT "options_optionGroupId_fkey" FOREIGN KEY ("optionGroupId") REFERENCES "option_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_optionGroupId_fkey" FOREIGN KEY ("optionGroupId") REFERENCES "option_group"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_optionsId_fkey" FOREIGN KEY ("optionsId") REFERENCES "options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_pictures" ADD CONSTRAINT "product_pictures_pictureId_fkey" FOREIGN KEY ("pictureId") REFERENCES "picture"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product_pictures" ADD CONSTRAINT "product_pictures_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist" ADD CONSTRAINT "wishlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recently_viewed" ADD CONSTRAINT "recently_viewed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post" ADD CONSTRAINT "blog_post_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "blog_category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tag" ADD CONSTRAINT "blog_post_tag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_post_tag" ADD CONSTRAINT "blog_post_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "blog_tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "blog_post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_comment" ADD CONSTRAINT "blog_comment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "blog_comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_product" ADD CONSTRAINT "collection_product_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "collection_product" ADD CONSTRAINT "collection_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES "product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
