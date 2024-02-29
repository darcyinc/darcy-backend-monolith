import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import { FastifyReply, FastifyRequest } from 'fastify';

export const POST = async (req: FastifyRequest<{ Params: { handle: string } }>, reply: FastifyReply) => {
  const { params } = req;
  const authData = await requireAuthorization(req);
  if (!authData.authorized) return authData.response;

  const [user, userToFollow] = await Promise.all([getUserByEmail(authData.email), getUserByHandle(params.handle)]);
  if (!user || !userToFollow) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  if (user.handle === userToFollow.handle)
    return reply.status(400).send({ error: 'cannot_follow_yourself', message: "You can't follow yourself." });

  if (user.followingIds.includes(userToFollow.id))
    return reply.status(400).send({ error: 'already_following', message: 'You are already following this user.' });

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

  return reply.status(204).send();
};

export const DELETE = async (req: FastifyRequest<{ Params: { handle: string } }>, reply: FastifyReply) => {
  const { params } = req;
  const authData = await requireAuthorization(req);
  if (!authData.authorized) return authData.response;

  const [user, userToUnfollow] = await Promise.all([getUserByEmail(authData.email), getUserByHandle(params.handle)]);
  if (!user || !userToUnfollow) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  if (!user.followingIds.includes(userToUnfollow.id))
    return reply.status(400).send({ error: 'not_following', message: 'You are not following this user.' });

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

  return reply.status(204).send();
};
