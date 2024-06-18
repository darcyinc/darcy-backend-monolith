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
      if (!user || !userToFollow) return notFound(reply);

      if (user.handle === userToFollow.handle) return badRequest(reply, 'cannot_follow_yourself', "You can't follow yourself.");

      const isAlreadyFollowing = await db.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: userToFollow.id
          }
        }
      });

      if (isAlreadyFollowing) return badRequest(reply, 'already_following', 'You are already following this user.');

      await Promise.all([
        db.userFollow.create({
          data: {
            followerId: user.id,
            followingId: userToFollow.id
          }
        }),

        db.user.update({
          where: {
            handle: user.handle
          },
          data: {
            followingCount: {
              increment: 1
            }
          }
        }),

        db.user.update({
          where: {
            handle: userToFollow.handle
          },
          data: {
            followingCount: {
              increment: 1
            }
          }
        })
      ]);

      return created(reply);
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
      if (!user || !userToUnfollow) return notFound(reply);

      if (user.handle === userToUnfollow.handle) return badRequest(reply, 'cannot_unfollow_yourself', "You can't unfollow yourself.");

      const isAlreadyFollowing = await db.userFollow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: userToUnfollow.id
          }
        }
      });

      if (!isAlreadyFollowing) return badRequest(reply, 'not_following', 'You are not following this user.');

      await Promise.all([
        db.userFollow.delete({
          where: {
            followerId_followingId: {
              followerId: user.id,
              followingId: userToUnfollow.id
            }
          }
        }),

        db.user.update({
          where: {
            handle: user.handle
          },
          data: {
            followingCount: {
              decrement: 1
            }
          }
        }),

        db.user.update({
          where: {
            handle: userToUnfollow.handle
          },
          data: {
            followingCount: {
              decrement: 1
            }
          }
        })
      ]);

      return created(reply);
    }
  );
}
