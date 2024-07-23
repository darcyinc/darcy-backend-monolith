-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_repostingPostId_fkey";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_repostingPostId_fkey" FOREIGN KEY ("repostingPostId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
