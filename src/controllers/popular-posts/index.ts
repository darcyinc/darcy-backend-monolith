import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { User } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';

export const GET = async (req: FastifyRequest<{ Querystring: { page?: string; limit?: string } }>, reply: FastifyReply) => {
  const { page, limit } = req.query;

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

  const popularPosts = await db.post.findMany({
    where: {
      parentId: null,
      author: {
        private: false
      }
    },
    include: {
      author: {
        select: {
          displayName: true,
          handle: true,
          avatarUrl: true,
          verified: true
        }
      }
    },
    take: validatedLimit.data,
    skip: (validatedPage.data - 1) * validatedLimit.data
  });

  const authData = await requireAuthorization(req);

  let user: User | null = null;

  if (authData.authorized) {
    user = await db.user.findFirst({
      where: {
        auth: {
          email: authData.email
        }
      }
    });
  }

  return new Response(
    JSON.stringify(
      popularPosts
        .sort((a, b) => b.likedIds.length - a.likedIds.length)
        .map((post) => ({
          ...post,
          authorId: undefined,
          likedIds: undefined,
          likeCount: post.likedIds.length,
          hasLiked: user ? post.likedIds.includes(user.id) : false
        }))
    )
  );
};
