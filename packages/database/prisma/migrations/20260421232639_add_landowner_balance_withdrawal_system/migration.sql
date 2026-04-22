-- CreateEnum
CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "LandownerBalance" (
    "id" TEXT NOT NULL,
    "landownerId" TEXT NOT NULL,
    "availableBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "pendingBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "withdrawnBalance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "lastCalculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LandownerBalance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "balanceId" TEXT NOT NULL,
    "landownerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "bankAccountLastFourDigits" TEXT,
    "bankAccountCountry" TEXT,
    "stripePayoutId" TEXT,
    "failureReason" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WithdrawalTransaction" (
    "id" TEXT NOT NULL,
    "withdrawalId" TEXT NOT NULL,
    "landownerId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'GBP',
    "stripePayout" JSONB,
    "status" TEXT NOT NULL,
    "failureCode" TEXT,
    "failureMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WithdrawalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LandownerBalance_landownerId_key" ON "LandownerBalance"("landownerId");

-- CreateIndex
CREATE INDEX "LandownerBalance_landownerId_idx" ON "LandownerBalance"("landownerId");

-- CreateIndex
CREATE UNIQUE INDEX "WithdrawalRequest_stripePayoutId_key" ON "WithdrawalRequest"("stripePayoutId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_landownerId_idx" ON "WithdrawalRequest"("landownerId");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_status_idx" ON "WithdrawalRequest"("status");

-- CreateIndex
CREATE INDEX "WithdrawalRequest_requestedAt_idx" ON "WithdrawalRequest"("requestedAt");

-- CreateIndex
CREATE INDEX "WithdrawalTransaction_withdrawalId_idx" ON "WithdrawalTransaction"("withdrawalId");

-- CreateIndex
CREATE INDEX "WithdrawalTransaction_landownerId_idx" ON "WithdrawalTransaction"("landownerId");

-- AddForeignKey
ALTER TABLE "LandownerBalance" ADD CONSTRAINT "LandownerBalance_landownerId_fkey" FOREIGN KEY ("landownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "LandownerBalance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalRequest" ADD CONSTRAINT "WithdrawalRequest_landownerId_fkey" FOREIGN KEY ("landownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalTransaction" ADD CONSTRAINT "WithdrawalTransaction_withdrawalId_fkey" FOREIGN KEY ("withdrawalId") REFERENCES "WithdrawalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WithdrawalTransaction" ADD CONSTRAINT "WithdrawalTransaction_landownerId_fkey" FOREIGN KEY ("landownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
