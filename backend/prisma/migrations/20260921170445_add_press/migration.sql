-- CreateTable
CREATE TABLE "Press" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "details" TEXT,
    "link" TEXT,
    "coverUrl" TEXT,
    "coverPublicId" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Press_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PressMedia" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "publicId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pressId" INTEGER NOT NULL,

    CONSTRAINT "PressMedia_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Press_slug_key" ON "Press"("slug");

-- AddForeignKey
ALTER TABLE "PressMedia" ADD CONSTRAINT "PressMedia_pressId_fkey" FOREIGN KEY ("pressId") REFERENCES "Press"("id") ON DELETE CASCADE ON UPDATE CASCADE;
