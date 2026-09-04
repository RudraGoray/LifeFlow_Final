-- CreateEnum
CREATE TYPE "Role" AS ENUM ('HOSPITAL', 'NGO', 'BLOODBANK', 'ADMIN');

-- CreateEnum
CREATE TYPE "OrgType" AS ENUM ('HOSPITAL', 'NGO');

-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FULFILLED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "StockLevel" AS ENUM ('ADEQUATE', 'LOW', 'CRITICAL');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "orgId" TEXT,
    "state" TEXT NOT NULL,
    "cityDistrict" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "OrgType" NOT NULL,
    "address" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cityDistrict" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donor" (
    "donorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "state" TEXT NOT NULL,
    "cityDistrict" TEXT NOT NULL,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("donorId")
);

-- CreateTable
CREATE TABLE "BloodBank" (
    "bloodBankId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cityDistrict" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BloodBank_pkey" PRIMARY KEY ("bloodBankId")
);

-- CreateTable
CREATE TABLE "Blood" (
    "bloodId" TEXT NOT NULL,
    "bloodBankId" TEXT NOT NULL,
    "donorId" TEXT,
    "state" TEXT NOT NULL,
    "cityDistrict" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "dateDonated" TIMESTAMP(3),
    "dateDemanded" TIMESTAMP(3),
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blood_pkey" PRIMARY KEY ("bloodId")
);

-- CreateTable
CREATE TABLE "DemandTicket" (
    "id" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "bloodId" TEXT,
    "bloodType" "BloodType" NOT NULL,
    "units" INTEGER NOT NULL,
    "urgency" "Urgency" NOT NULL DEFAULT 'MEDIUM',
    "department" TEXT,
    "requiredBy" TIMESTAMP(3),
    "patientRefId" TEXT,
    "diagnosis" TEXT,
    "notes" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandTicket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DonationBatch" (
    "id" TEXT NOT NULL,
    "ngoId" TEXT NOT NULL,
    "bloodId" TEXT,
    "campName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "units" INTEGER NOT NULL,
    "donorCount" INTEGER NOT NULL DEFAULT 0,
    "receivingBankId" TEXT NOT NULL,
    "lotRef" TEXT,
    "notes" TEXT,
    "status" "TicketStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DonationBatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BloodInventory" (
    "id" TEXT NOT NULL,
    "bloodBankId" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "units" INTEGER NOT NULL DEFAULT 0,
    "statusLevel" "StockLevel" NOT NULL DEFAULT 'ADEQUATE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BloodInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Camp" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "tagType" TEXT,
    "state" TEXT NOT NULL,
    "cityDistrict" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Camp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StatsSnapshot" (
    "id" TEXT NOT NULL,
    "month" TIMESTAMP(3) NOT NULL,
    "state" TEXT NOT NULL,
    "cityDistrict" TEXT NOT NULL,
    "bloodType" "BloodType" NOT NULL,
    "donated" INTEGER NOT NULL DEFAULT 0,
    "demanded" INTEGER NOT NULL DEFAULT 0,
    "forecast" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "StatsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BloodInventory_bloodBankId_bloodType_key" ON "BloodInventory"("bloodBankId", "bloodType");

-- CreateIndex
CREATE UNIQUE INDEX "StatsSnapshot_month_state_cityDistrict_bloodType_key" ON "StatsSnapshot"("month", "state", "cityDistrict", "bloodType");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blood" ADD CONSTRAINT "Blood_bloodBankId_fkey" FOREIGN KEY ("bloodBankId") REFERENCES "BloodBank"("bloodBankId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Blood" ADD CONSTRAINT "Blood_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("donorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandTicket" ADD CONSTRAINT "DemandTicket_bloodId_fkey" FOREIGN KEY ("bloodId") REFERENCES "Blood"("bloodId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationBatch" ADD CONSTRAINT "DonationBatch_bloodId_fkey" FOREIGN KEY ("bloodId") REFERENCES "Blood"("bloodId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DonationBatch" ADD CONSTRAINT "DonationBatch_receivingBankId_fkey" FOREIGN KEY ("receivingBankId") REFERENCES "BloodBank"("bloodBankId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BloodInventory" ADD CONSTRAINT "BloodInventory_bloodBankId_fkey" FOREIGN KEY ("bloodBankId") REFERENCES "BloodBank"("bloodBankId") ON DELETE RESTRICT ON UPDATE CASCADE;
