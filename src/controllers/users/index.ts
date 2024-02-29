import { PatchUserDto } from '@/dtos/users';
import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import { FastifyReply, FastifyRequest } from 'fastify';

export const GET = async (req: FastifyRequest<{ Params: { handle: string } }>, reply: FastifyReply) => {
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

export const PATCH = async (
  req: FastifyRequest<{ Params: { handle: string }; Body: { displayName?: string; handle?: string; bio?: string } }>,
  reply: FastifyReply
) => {
  // Only allow updating the @me user
  if (req.params.handle !== '@me') {
    return new Response(
      JSON.stringify({
        error: 'update_user_with_at_handle',
        message: 'To update a user, you must use the @me handle'
      }),
      {
        status: 401
      }
    );
  }

  const data = req.body;
  const parsedData = await PatchUserDto.safeParseAsync(data);

  if (!parsedData.success) {
    return reply.status(400).send({
      error: parsedData.error.errors[0].message
    });
  }

  const authData = await requireAuthorization(req);
  if (!authData.authorized) return authData.response;

  const user = await getUserByEmail(authData.email);
  if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  if (parsedData.data.handle) {
    const handleExists = await getUserByHandle(parsedData.data.handle);
    if (handleExists && handleExists.id !== user.id) {
      return reply.status(409).send({ error: 'handle_already_user', message: 'Handle is being used by another user.' });
    }
  }

  const [newUser, followersCount] = await Promise.all([
    db.user.update({
      where: { id: user.id },
      data: {
        displayName: data.displayName || user.displayName,
        handle: data.handle || user.handle,
        bio: data.bio || user.bio
      }
    }),
    db.user.count({
      where: {
        followingIds: {
          has: user.id
        }
      }
    })
  ]);

  return new Response(
    JSON.stringify({ ...newUser, followersCount, followingCount: user.followingIds.length, followingIds: undefined, id: undefined })
  );
};
