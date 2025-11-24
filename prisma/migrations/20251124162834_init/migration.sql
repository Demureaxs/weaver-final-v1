-- AlterTable
ALTER TABLE "public"."Book" ADD COLUMN     "totalTargetWords" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."Chapter" ADD COLUMN     "actualWordCount" INTEGER DEFAULT 0,
ADD COLUMN     "targetWordCount" INTEGER DEFAULT 1000;
