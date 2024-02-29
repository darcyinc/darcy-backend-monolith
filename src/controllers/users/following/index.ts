import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import { User } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';

export const GET = async (
  req: FastifyRequest<{ Params: { handle: string }; Querystring: { page: number; limit: number } }>,
  reply: FastifyReply
) => {
  const { params } = req;
  const { page, limit } = req.query;
  const authData = await requireAuthorization(req);

  const [validatedPage, validatedLimit] = await Promise.all([
    FollowingPageDto.safeParseAsync(page),
    FollowingLimitDto.safeParseAsync(limit)
  ]);

  if (!validatedPage.success) {
    return reply.status(400).send({
      error: validatedPage.error.errors[0].message
    });
  }
  if (!validatedLimit.success) {
    return reply.status(400).send({
      error: validatedLimit.error.errors[0].message
    });
  }

  let user: User | null = null;

  if (params.handle === '@me') {
    if (!authData.authorized) return authData.response;

    user = await getUserByEmail(authData.email);
    if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });
  }

  if (!user) user = await getUserByHandle(params.handle);
  if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  const following = await db.user.findMany({
    where: {
      id: {
        in: user.followingIds
      }
    },
    take: validatedLimit.data,
    skip: (validatedPage.data - 1) * validatedLimit.data
  });

  return reply.send(
    following.map((user) => ({
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      displayName: user.displayName,
      handle: user.handle
    }))
  );
};
