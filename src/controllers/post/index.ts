import { CreatePostDto } from '@/dtos/post';
import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail } from '@/services/users';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { z } from 'zod';

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
          private: true,
          verified: true
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
    authorId: undefined,
    likedIds: undefined,
    likeCount: post.likedIds.length,
    hasLiked
  });
};

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

  const parentPostId = parsedData.data.parentId;

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
