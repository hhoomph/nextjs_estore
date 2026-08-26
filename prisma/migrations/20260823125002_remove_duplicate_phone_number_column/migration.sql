/*
  Warnings:

  - You are about to drop the column `phone_number` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "account" ALTER COLUMN "issuer" DROP DEFAULT;

-- AlterTable
ALTER TABLE "user" DROP COLUMN "phone_number";
