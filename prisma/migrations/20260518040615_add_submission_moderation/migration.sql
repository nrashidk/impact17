-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'CLEAN', 'FLAGGED', 'ERROR');

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "modCategory" TEXT,
ADD COLUMN     "modReason" TEXT,
ADD COLUMN     "modStatus" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "processingStartedAt" TIMESTAMP(3);

