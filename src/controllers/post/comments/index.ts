import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { db } from '@/helpers/db';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getUserByEmail } from '@/services/users';
import type { User } from '@prisma/client';
import { z } from 'zod';

export async function getPostComments(app: AppInstance) {
  app.get(
    '/:postId/comments',
    {
      onRequest: [optionalAuthorization] as never,
      schema: {
        params: z.object({
          postId: z.string()
        }),
        querystring: z.object({
          page: FollowingPageDto,
          limit: FollowingLimitDto
        })
      }
    },
    async (request, reply) => {
      const { params, query } = request;
      const { page, limit } = query;
      const { authorized, email } = request.authorization;

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
        if (!authorized)
          return reply.status(401).send({
            error: 'Unauthorized'
          });

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
          comments: true,
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
        take: limit,
        skip: (page - 1) * limit
      });

      let user: User | null = null;

      if (authorized) {
        user = await getUserByEmail(email);
        if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });
      }

      return reply.status(200).send(
        comments.map((comment) => ({
          ...comment,
          commentCount: comment.comments.length,
          authorId: undefined,
          likedIds: undefined,
          likeCount: post.likedIds.length,
          hasLiked: user && comment.likedIds.includes(user.id)
        }))
      );
    }
  );
}
