import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { db } from '@/helpers/db';
import { notFound, ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import type { User } from '@prisma/client';
import { z } from 'zod';

export async function getUserFollowing(app: AppInstance) {
  app.get(
    '/:handle/following',
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
        if (!authorized) return unauthorized({ reply });

        user = await getUserByEmail(email);
        if (!user) return notFound({ reply });
      }

      user ??= await getUserByHandle(params.handle);
      if (!user) return notFound({ reply });

      // TODO: handle private accounts
      if (user.private) return unauthorized({ reply });

      const following = await db.user.findMany({
        where: {
          id: {
            in: user.followingIds
          }
        },
        take: limit,
        skip: (page - 1) * limit
      });

      return ok({
        reply,
        data: following.map((user) => ({
          avatarUrl: user.avatarUrl,
          bio: user.bio,
          displayName: user.displayName,
          handle: user.handle
        }))
      });
    }
  );
}
