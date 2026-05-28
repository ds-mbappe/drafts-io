CREATE TABLE "RecentlyRead" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecentlyRead_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "RecentlyRead_userId_draftId_key" ON "RecentlyRead"("userId", "draftId");
CREATE INDEX "RecentlyRead_userId_viewedAt_idx" ON "RecentlyRead"("userId", "viewedAt" DESC);

ALTER TABLE "RecentlyRead" ADD CONSTRAINT "RecentlyRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "RecentlyRead" ADD CONSTRAINT "RecentlyRead_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE CASCADE ON UPDATE CASCADE;
