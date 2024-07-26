import { db } from '@/helpers/db';
import { ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { filterFields } from '@/utils/filter-fields';
import type { Post, PostLike, UserFollow } from '@prisma/client';
import { allowedPostFields } from './create-post';
import { allowedPostAuthorFields } from './get-post';

// This route should only be available on the development phase, when releasing, remove it.
export async function getRecentPublicPosts(app: AppInstance) {
  app.get(
    '/recent',
    {
      schema: {}
    },
    async (request, reply) => {
      const rawPosts = await db.post.findMany({
        where: {
          author: {
            privacy: 'PUBLIC'
          }
        },
        include: {
          author: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 20
      });

      let likedPosts = [] as PostLike[];
      let repostedPosts = [] as Post[];
      let followingPostAuthors = [] as UserFollow[];

      if (request.authorization.authorized) {
        [likedPosts, repostedPosts, followingPostAuthors] = await db.$transaction([
          db.postLike.findMany({
            where: {
              userId: request.authorization.user.id,
              postId: {
                in: rawPosts.map((post) => post.id)
              }
            }
          }),
          db.post.findMany({
            where: {
              authorId: request.authorization.user.id,
              repostingPostId: {
                in: rawPosts.map((post) => post.id)
              }
            }
          }),
          db.userFollow.findMany({
            where: {
              followerId: request.authorization.user.id,
              targetId: {
                in: rawPosts.map((post) => post.authorId)
              }
            }
          })
        ]);
      }

      const posts = rawPosts.map((post) => {
        const has_liked = !!likedPosts.find((likedPost) => likedPost.postId === post.id);
        const has_reposted = !!repostedPosts.find((repostedPost) => repostedPost.id === post.id);
        const is_following_post_owner = !!followingPostAuthors.find((follow) => follow.targetId === post.authorId);

        return {
          ...filterFields(allowedPostFields, post),
          author: filterFields(allowedPostAuthorFields, post.author),
          has_liked,
          has_reposted,
          is_following_post_owner,
          can_reply: post.replyPrivacy === 'PUBLIC' || (post.replyPrivacy === 'ONLY_FOLLOWERS' && is_following_post_owner)
        };
      });

      ok(reply, posts);
    }
  );
}
