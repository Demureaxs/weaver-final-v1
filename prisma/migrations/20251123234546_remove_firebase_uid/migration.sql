/*
  Warnings:

  - You are about to drop the column `firebaseUid` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."User_firebaseUid_key";

-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "firebaseUid";
