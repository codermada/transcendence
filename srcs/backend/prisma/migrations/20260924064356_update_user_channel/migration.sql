/*
  Warnings:

  - You are about to drop the column `isOwner` on the `user_in_channels` table. All the data in the column will be lost.
  - You are about to drop the `Task` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ChannelRole" AS ENUM ('ADMIN', 'MEMBER');

-- AlterTable
ALTER TABLE "user_in_channels" DROP COLUMN "isOwner",
ADD COLUMN     "role" "ChannelRole" NOT NULL DEFAULT 'MEMBER';

-- DropTable
DROP TABLE "Task";
