import { db } from '@/helpers/db';
import { notFound, ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import type { User } from '@prisma/client';
import { object, string } from 'zod';

export const allowedUserFields: [string, keyof User][] = [
  ['avatar_url', 'avatarUrl'],
  ['banner_url', 'bannerUrl'],
  ['bio', 'bio'],
  ['full_name', 'fullName'],
  ['handle', 'handle'],
  ['dm_privacy', 'dmPrivacy'],
  ['profile_privacy', 'privacy'],
  ['followers_count', 'followersCount'],
  ['following_count', 'followingCount'],
  ['post_count', 'postCount'],
  ['comments_count', 'commentsCount'],
  ['liked_posts_count', 'likedPostsCount'],
  ['verification_state', 'verificationState'],
  ['created_at', 'createdAt'],
  ['updated_at', 'updatedAt']
];

export const getAllowedUserFields = (user: User) => {
  const data = {} as Record<string, unknown>;

  for (const [key, value] of allowedUserFields) {
    data[key] = user[value];
  }

  return data;
};

export async function getUserByHandle(app: AppInstance) {
  app.get(
    '/:handle',
    {
      schema: {
        params: object({
          handle: string()
        })
      },
      onRequest: [optionalAuthorization] as never
    },
    async (request, reply) => {
      const user = await db.user.findFirst({
        where: {
          handle: {
            equals: request.params.handle,
            mode: 'insensitive'
          }
        }
      });

      if (!user) return notFound(reply, 'unknown_user', 'Unknown user.');

      let additionalFields: Record<string, unknown> = {};

      if (user.privacy === 'PRIVATE') {
        additionalFields = {
          post_count: 0,
          comments_count: 0,
          liked_posts_count: 0
        };
      }

      if (request.authorization.authorized) {
        const userFollow = await db.userFollow.findFirst({
          where: {
            followerId: request.authorization.user.id,
            targetId: user.id
          }
        });

        additionalFields.is_following = Boolean(userFollow);
        additionalFields.is_self_user = request.authorization.user?.id === user.id ?? false;

        if (userFollow) {
          additionalFields = {
            ...additionalFields,
            post_count: user.postCount,
            comments_count: user.commentsCount,
            liked_posts_count: user.likedPostsCount
          };
        }
      }

      return ok(reply, {
        ...getAllowedUserFields(user),
        ...additionalFields
      });
    }
  );
}
