import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail } from '@/services/users';
import { FastifyReply, FastifyRequest } from 'fastify';

export const GET = async (req: FastifyRequest<{ Params: { postId: string } }>, reply: FastifyReply) => {
  const { params } = req;
  const authData = await requireAuthorization(req);

  const post = await db.post.findUnique({
    where: {
      id: params.postId
    },
    include: {
      author: {
        select: {
          avatarUrl: true,
          displayName: true,
          handle: true,
          private: true
        }
      }
    }
  });

  if (!post) return reply.status(404).send({ error: 'post_not_found', message: 'Post not found.' });

  if (post.author.private) {
    if (!authData.authorized) return authData.response;

    return reply.status(403).send({ error: 'get_post_private', message: 'This post is private. You must follow the user to see it.' });
  }

  let hasLiked = false;

  if (authData.authorized) {
    const user = await getUserByEmail(authData.email);
    if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });
    hasLiked = post.likedIds.includes(user.id);
  }

  return reply.status(200).send({
    ...post,
    likedIds: undefined,
    likeCount: post.likedIds.length,
    hasLiked
  });
};
