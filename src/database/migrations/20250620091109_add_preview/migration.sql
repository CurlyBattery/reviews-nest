/*
  Warnings:

  - You are about to drop the column `preview` on the `reviews` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "reviews" DROP COLUMN "preview",
ADD COLUMN     "preview_id" INTEGER;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_preview_id_fkey" FOREIGN KEY ("preview_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
