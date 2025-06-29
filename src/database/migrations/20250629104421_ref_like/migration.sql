/*
  Warnings:

  - Added the required column `hasDisliked` to the `dislikes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hasLiked` to the `likes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "dislikes" ADD COLUMN     "hasDisliked" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "likes" ADD COLUMN     "hasLiked" BOOLEAN NOT NULL;
