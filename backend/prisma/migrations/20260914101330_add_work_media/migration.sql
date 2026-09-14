-- CreateTable
CREATE TABLE "WorkMedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workId" INTEGER NOT NULL,

    CONSTRAINT "WorkMedia_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkMedia" ADD CONSTRAINT "WorkMedia_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
