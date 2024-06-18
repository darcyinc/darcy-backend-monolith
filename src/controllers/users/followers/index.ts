import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { db } from '@/helpers/db';
import { notFound, ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import type { User } from '@prisma/client';
import { z } from 'zod';

export async function getUserFollowers(app: AppInstance) {
  app.get(
    '/:handle/followers',
    {
      onRequest: [optionalAuthorization] as never,
      schema: {
        params: z.object({
          handle: z.string()
        }),
        querystring: z.object({
          page: FollowingPageDto,
          limit: FollowingLimitDto
        })
      }
    },
    async (request, reply) => {
      const { params } = request;
      const { page, limit } = request.query;
      const { authorized, email } = request.authorization;

      let user: User | null = null;

      if (params.handle === '@me') {
        if (!authorized) return unauthorized(reply);

        user = await getUserByEmail(email);
        if (!user) return notFound(reply);
      }

      user ??= await getUserByHandle(params.handle);
      if (!user) return notFound(reply);

      const followersIds = await db.userFollow.findMany({
        where: {
          followingId: user.id
        },
        take: limit,
        skip: (page - 1) * limit
      });

      const usersFollowing = await db.user.findMany({
        where: {
          id: {
            in: followersIds.map((following) => following.followingId)
          }
        }
      });

      return ok(
        reply,
        usersFollowing.map((user) => ({
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          displayName: user.displayName,
          handle: user.handle
        }))
      );
    }
  );
}
