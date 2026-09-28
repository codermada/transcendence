/*
  Warnings:

  - You are about to drop the column `user1Id` on the `friendships` table. All the data in the column will be lost.
  - You are about to drop the column `user2Id` on the `friendships` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[pairKey]` on the table `friendships` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `addresseeId` to the `friendships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pairKey` to the `friendships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requesterId` to the `friendships` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `friendships` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'BLOCKED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "friendships" DROP CONSTRAINT "friendships_user2Id_fkey";

-- DropIndex
DROP INDEX "friendships_user1Id_idx";

-- DropIndex
DROP INDEX "friendships_user1Id_user2Id_key";

-- DropIndex
DROP INDEX "friendships_user2Id_idx";

-- AlterTable
ALTER TABLE "friendships" DROP COLUMN "user1Id",
DROP COLUMN "user2Id",
ADD COLUMN     "addresseeId" TEXT NOT NULL,
ADD COLUMN     "blockedAt" TIMESTAMP(3),
ADD COLUMN     "blockedById" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "message" TEXT,
ADD COLUMN     "pairKey" TEXT NOT NULL,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "requesterId" TEXT NOT NULL,
ADD COLUMN     "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "friendships_pairKey_key" ON "friendships"("pairKey");

-- CreateIndex
CREATE INDEX "friendships_requesterId_status_idx" ON "friendships"("requesterId", "status");

-- CreateIndex
CREATE INDEX "friendships_addresseeId_status_idx" ON "friendships"("addresseeId", "status");

-- CreateIndex
CREATE INDEX "friendships_blockedById_idx" ON "friendships"("blockedById");

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendships" ADD CONSTRAINT "friendships_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
