/*
  Warnings:

  - You are about to drop the `Dislike` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Like` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Dislike" DROP CONSTRAINT "Dislike_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Dislike" DROP CONSTRAINT "Dislike_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_review_id_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_user_id_fkey";

-- DropTable
DROP TABLE "Dislike";

-- DropTable
DROP TABLE "Like";

-- CreateTable
CREATE TABLE "likes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dislikes" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,

    CONSTRAINT "dislikes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "likes_review_id_user_id_key" ON "likes"("review_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dislikes_review_id_user_id_key" ON "dislikes"("review_id", "user_id");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dislikes" ADD CONSTRAINT "dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dislikes" ADD CONSTRAINT "dislikes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;
