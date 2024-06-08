import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { GetUserPostsDto } from '@/dtos/users/posts';
import { db } from '@/helpers/db';
import { notFound, ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import type { User } from '@prisma/client';
import { z } from 'zod';

export async function getUserPosts(app: AppInstance) {
  app.get(
    '/:handle/posts',
    {
      onRequest: [optionalAuthorization] as never,
      schema: {
        params: z.object({
          handle: z.string()
        }),
        querystring: z.object({
          type: GetUserPostsDto,
          page: FollowingPageDto,
          limit: FollowingLimitDto
        })
      }
    },
    async (request, reply) => {
      const { params } = request;
      const { page, type, limit } = request.query;
      const { authorized, email } = request.authorization;

      let user: User | null = null;
      let userWhoRequested: User | null = null;

      if (params.handle === '@me') {
        if (!authorized) return unauthorized(reply);

        user = await getUserByEmail(email);
        userWhoRequested = user;
        if (!user) return notFound(reply);
      }

      user ??= await getUserByHandle(params.handle);
      if (!user) return notFound(reply);

      if (user.private) {
        // TODO: implement private user profile
        return notFound(reply);
      }

      const { posts } = await db.user.findFirstOrThrow({
        where: {
          handle: user.handle
        },
        include: {
          posts: {
            include: {
              comments: true
            },
            where: {
              // if postType is posts, we want to get all posts
              // if postType is replies, we want to get all replies
              parentId: type === 'posts' ? null : { not: null }
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: limit,
            skip: (page - 1) * limit
          }
        }
      });

      return ok(
        reply,
        posts.map((post) => ({
          ...post,
          authorId: undefined,
          commentCount: post.comments.length,
          likedIds: undefined,
          likeCount: post.likedIds.length,
          hasLiked: userWhoRequested ? post.likedIds.includes(userWhoRequested.id) : false
        }))
      );
    }
  );
}
