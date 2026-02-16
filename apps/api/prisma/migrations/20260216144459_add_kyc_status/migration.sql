-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'NONE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kycStatus" "KycStatus" NOT NULL DEFAULT 'NONE';
