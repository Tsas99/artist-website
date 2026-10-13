-- CreateTable
CREATE TABLE "WorkLink" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "workId" INTEGER NOT NULL,

    CONSTRAINT "WorkLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkLink_workId_idx" ON "WorkLink"("workId");

-- AddForeignKey
ALTER TABLE "WorkLink" ADD CONSTRAINT "WorkLink_workId_fkey" FOREIGN KEY ("workId") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
