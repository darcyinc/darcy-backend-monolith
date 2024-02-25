import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import { FastifyReply, FastifyRequest } from 'fastify';

export const get = async (req: FastifyRequest<{ Params: { handle: string } }>, reply: FastifyReply) => {
  const authData = await requireAuthorization(req);

  if (req.params.handle === '@me') {
    if (!authData.authorized) return authData.response;

    const user = await getUserByEmail(authData.email);
    if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

    const followersCount = await db.user.count({
      where: {
        followingIds: {
          has: user.id
        }
      }
    });

    return reply.send({
      ...user,
      followersCount,
      followingCount: user.followingIds.length,
      followingIds: undefined,
      id: undefined
    });
  }

  const user = await getUserByHandle(req.params.handle);
  if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  // get follower count and check if current user follows target user
  const [currentUser, followersCount] = await Promise.all([
    authData.authorized
      ? db.user.findFirst({
          where: { auth: { email: authData.email } }
        })
      : null,
    db.user.count({
      where: {
        followingIds: {
          has: user.id
        }
      }
    })
  ]);

  return reply.send({
    ...user,
    followersCount,
    followingCount: user.followingIds.length,
    isFollowing: currentUser?.followingIds.includes(user.id) ?? false,
    followingIds: undefined,
    id: undefined
  });
};
