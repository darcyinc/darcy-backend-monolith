import { db } from '@/helpers/db';
import { badRequest, created, notFound } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import { z } from 'zod';

export async function followUser(app: AppInstance) {
  app.post(
    '/:handle/follow',
    {
      onRequest: [enforceAuthorization] as never,
      schema: {
        params: z.object({
          handle: z.string()
        })
      }
    },
    async (request, reply) => {
      const { params } = request;
      const { authorized, email } = request.authorization;

      if (!authorized) return;

      const [user, userToFollow] = await Promise.all([getUserByEmail(email), getUserByHandle(params.handle)]);
      if (!user || !userToFollow) return notFound({ reply });

      if (user.handle === userToFollow.handle)
        return badRequest({ reply, data: { error: 'cannot_follow_yourself', message: "You can't follow yourself." } });

      if (user.followingIds.includes(userToFollow.id))
        return badRequest({ reply, data: { error: 'already_following', message: 'You are already following this user.' } });

      await db.user.update({
        where: {
          handle: user.handle
        },
        data: {
          followingIds: {
            push: userToFollow.id
          }
        }
      });

      return created({ reply });
    }
  );
}

export async function unfollowUser(app: AppInstance) {
  app.delete(
    '/:handle/follow',
    {
      onRequest: [enforceAuthorization] as never,
      schema: {
        params: z.object({
          handle: z.string()
        })
      }
    },
    async (request, reply) => {
      const { params } = request;
      const { authorized, email } = request.authorization;

      if (!authorized) return;

      const [user, userToUnfollow] = await Promise.all([getUserByEmail(email), getUserByHandle(params.handle)]);
      if (!user || !userToUnfollow) return notFound({ reply });

      if (user.handle === userToUnfollow.handle)
        return badRequest({ reply, data: { error: 'cannot_unfollow_yourself', message: "You can't unfollow yourself." } });

      if (!user.followingIds.includes(userToUnfollow.id))
        return badRequest({ reply, data: { error: 'not_following', message: 'You are not following this user.' } });

      await db.user.update({
        where: {
          handle: user.handle
        },
        data: {
          followingIds: {
            set: user.followingIds.filter((id) => id !== userToUnfollow.id)
          }
        }
      });

      return created({ reply });
    }
  );
}
