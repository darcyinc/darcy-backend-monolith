import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { db } from '@/helpers/db';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import type { User } from '@prisma/client';
import { z } from 'zod';

export async function getPopularPosts(app: AppInstance) {
  app.get(
    '/',
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
      const { page, limit } = request.query;
      const { authorized, email } = request.authorization;

      const popularPosts = await db.post.findMany({
        where: {
          parentId: null,
          author: {
            private: false
          }
        },
        include: {
          comments: true,
          author: {
            select: {
              displayName: true,
              handle: true,
              avatarUrl: true,
              verified: true
            }
          }
        },
        take: limit,
        skip: (page - 1) * limit
      });

      let user: User | null = null;

      if (authorized) {
        user = await db.user.findFirst({
          where: {
            auth: {
              email
            }
          }
        });
      }

      return reply.send(
        popularPosts
          .sort((a, b) => b.likedIds.length - a.likedIds.length)
          .map((post) => ({
            ...post,
            authorId: undefined,
            commentCount: post.comments.length,
            likedIds: undefined,
            likeCount: post.likedIds.length,
            hasLiked: user ? post.likedIds.includes(user.id) : false
          }))
      );
    }
  );
}
