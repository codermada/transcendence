-- AlterTable
ALTER TABLE "user_channel_messages" ADD COLUMN     "seenBy" TEXT[] DEFAULT ARRAY[]::TEXT[];
