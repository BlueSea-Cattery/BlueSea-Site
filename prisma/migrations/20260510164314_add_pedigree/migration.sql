-- AlterTable
ALTER TABLE "Litter" ADD COLUMN     "pedigreeId" TEXT;

-- CreateTable
CREATE TABLE "Pedigree" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pedigree_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Litter" ADD CONSTRAINT "Litter_pedigreeId_fkey" FOREIGN KEY ("pedigreeId") REFERENCES "Pedigree"("id") ON DELETE SET NULL ON UPDATE CASCADE;
