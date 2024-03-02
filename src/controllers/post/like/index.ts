import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail } from '@/services/users';
import { FastifyReply, FastifyRequest } from 'fastify';

export const POST = async (req: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const { params } = req;
  const authData = await requireAuthorization(req);
  if (!authData.authorized) return authData.response;

  const user = await getUserByEmail(authData.email);
  if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  const post = await db.post.findUnique({
    where: {
      id: params.postId
    }
  });
  if (!post) return reply.status(404).send({ error: 'post_not_found', message: 'Post not found.' });

  if (post.likedIds.includes(user.id)) return reply.status(400).send({ error: 'already_liked', message: 'You already liked this post.' });

  await db.post.update({
    where: {
      id: params.postId
    },
    data: {
      likedIds: {
        push: user.id
      }
    }
  });

  return reply.status(204).send();
};

export const DELETE = async (req: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const { params } = req;
  const authData = await requireAuthorization(req);
  if (!authData.authorized) return authData.response;

  const user = await getUserByEmail(authData.email);
  if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  const post = await db.post.findUnique({
    where: {
      id: params.postId
    }
  });
  if (!post) return reply.status(404).send({ error: 'post_not_found', message: 'Post not found.' });

  if (!post.likedIds.includes(user.id)) return reply.status(400).send({ error: 'not_liked', message: 'You have not liked this post.' });

  await db.post.update({
    where: {
      id: params.postId
    },
    data: {
      likedIds: {
        set: post.likedIds.filter((id) => id !== user.id)
      }
    }
  });

  return reply.status(204).send();
};
