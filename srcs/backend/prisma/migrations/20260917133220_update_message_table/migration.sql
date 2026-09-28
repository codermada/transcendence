/*
  Warnings:

  - Added the required column `messageTableId` to the `messages` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "messages" ADD COLUMN     "messageTableId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "message_tables" (
    "id" TEXT NOT NULL,
    "user1Id" TEXT,
    "user2Id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pairKey" TEXT NOT NULL,

    CONSTRAINT "message_tables_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_tables_pairKey_key" ON "message_tables"("pairKey");

-- CreateIndex
CREATE INDEX "message_tables_user1Id_idx" ON "message_tables"("user1Id");

-- CreateIndex
CREATE INDEX "message_tables_user2Id_idx" ON "message_tables"("user2Id");

-- CreateIndex
CREATE INDEX "messages_messageTableId_createdAt_idx" ON "messages"("messageTableId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "message_tables" ADD CONSTRAINT "message_tables_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_tables" ADD CONSTRAINT "message_tables_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_messageTableId_fkey" FOREIGN KEY ("messageTableId") REFERENCES "message_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
