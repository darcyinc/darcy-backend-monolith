import { db } from '@/helpers/db';
import { notFound, ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { filterFields } from '@/utils/filter-fields';
import type { User } from '@prisma/client';
import { object, string } from 'zod';
import { allowedPostFields } from './create-post';

export const allowedPostAuthorFields: [string, keyof User][] = [
  ['id', 'id'],
  ['handle', 'handle'],
  ['full_name', 'fullName'],
  ['avatar_url', 'avatarUrl'],
  ['banner_url', 'bannerUrl'],
  ['bio', 'bio'],
  ['post_count', 'postCount'],
  ['privacy', 'privacy'],
  ['verification_state', 'verificationState'],
  ['following_count', 'followingCount'],
  ['followers_count', 'followersCount'],
  ['created_at', 'createdAt'],
  ['updated_at', 'updatedAt']
];

export async function getPost(app: AppInstance) {
  app.get(
    '/:postId',
    {
      schema: {
        params: object({
          postId: string()
        })
      },
      onRequest: [optionalAuthorization] as never
    },
    async (request, reply) => {
      const post = await db.post.findUnique({
        where: {
          id: request.params.postId
        },
        include: {
          author: true
        }
      });

      if (!post) return notFound(reply, 'unknown_post', 'Unknown post.');

      if (post.author.privacy === 'PRIVATE') {
        if (!request.authorization.authorized) return notFound(reply, 'unknown_post', 'Unknown post.');

        const following = await db.userFollow.findUnique({
          where: {
            followerId_targetId: {
              followerId: request.authorization.user.id,
              targetId: post.authorId
            }
          }
        });

        if (!following) return notFound(reply, 'unknown_post', 'Unknown post.');
      }

      let additionalFields: Record<string, unknown> = {};

      if (request.authorization.authorized && !post.deleted) {
        const [hasLiked, hasReposted, isFollowingPostOwner] = await db.$transaction([
          db.postLike.findUnique({
            where: {
              postId_userId: {
                postId: post.id,
                userId: request.authorization.user.id
              }
            }
          }),
          db.post.findUnique({
            where: {
              authorId_repostingPostId: {
                authorId: request.authorization.user.id,
                repostingPostId: post.id
              }
            }
          }),
          db.userFollow.findUnique({
            where: {
              followerId_targetId: {
                followerId: request.authorization.user.id,
                targetId: post.authorId
              }
            }
          })
        ]);

        additionalFields = {
          has_liked: !!hasLiked,
          has_reposted: !!hasReposted,
          is_following_post_owner: !!isFollowingPostOwner,
          can_reply: post.replyPrivacy === 'PUBLIC' || (post.replyPrivacy === 'ONLY_FOLLOWERS' && !!isFollowingPostOwner)
        };
      }

      ok(reply, {
        ...filterFields(allowedPostFields, post),
        author: filterFields(allowedPostAuthorFields, post.author),
        ...additionalFields
      });
    }
  );
}
