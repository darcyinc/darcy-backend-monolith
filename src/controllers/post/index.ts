import { CreatePostDto } from '@/dtos/post';
import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail } from '@/services/users';
import { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';

export const POST = async (req: FastifyRequest<{ Body: z.infer<typeof CreatePostDto> }>, reply: FastifyReply) => {
  const { body } = req;

  const parsedData = await CreatePostDto.safeParseAsync(body);
  if (!parsedData.success) {
    return reply.status(400).send({
      error: parsedData.error.errors[0].message
    });
  }

  const authData = await requireAuthorization(req);
  if (!authData.authorized) return authData.response;

  const user = await getUserByEmail(authData.email);
  if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  const parentPostId = parsedData.data.parent;

  if (parentPostId) {
    const parentPost = await db.post.findUnique({
      where: {
        id: parentPostId
      }
    });

    if (!parentPost) {
      return reply.status(404).send({ error: 'parent_post_not_found', message: 'Parent post not found.' });
    }
  }

  const post = await db.post.create({
    data: {
      authorId: user.id,
      parentId: parentPostId,
      content: parsedData.data.content
    },
    include: {
      author: {
        select: {
          avatarUrl: true,
          displayName: true,
          handle: true,
          verified: true
        }
      }
    }
  });

  return reply.status(201).send({
    ...post,
    likedIds: undefined,
    likeCount: 0,
    hasLiked: false
  });
};
