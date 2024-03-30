import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail } from '@/services/users';
import type { User } from '@prisma/client';
import type { FastifyReply, FastifyRequest } from 'fastify';

export const GET = async (
  req: FastifyRequest<{ Params: { postId: string }; Querystring: { page?: string; limit?: string } }>,
  reply: FastifyReply
) => {
  const { params, query } = req;
  const { page, limit } = query;

  const [validatedPage, validatedLimit] = await Promise.all([
    FollowingPageDto.safeParseAsync(Number(page ?? 1)),
    FollowingLimitDto.safeParseAsync(Number(limit ?? 50))
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

  const authData = await requireAuthorization(req);

  if (post.author.private) {
    if (!authData.authorized) return authData.response;

    return reply.status(403).send({ error: 'get_post_private', message: 'This post is private. You must follow the user to see it.' });
  }

  const comments = await db.post.findMany({
    where: {
      parentId: params.postId
    },
    orderBy: {
      createdAt: 'desc'
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
    },
    take: validatedLimit.data,
    skip: (validatedPage.data - 1) * validatedLimit.data
  });

  let user: User | null = null;

  if (authData.authorized) {
    user = await getUserByEmail(authData.email);
    if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });
  }

  return reply.status(200).send(
    comments.map((comment) => ({
      ...comment,
      authorId: undefined,
      likedIds: undefined,
      likeCount: post.likedIds.length,
      hasLiked: user && comment.likedIds.includes(user.id)
    }))
  );
};
