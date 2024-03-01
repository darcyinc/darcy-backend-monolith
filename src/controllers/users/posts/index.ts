import { FollowingLimitDto, FollowingPageDto } from '@/dtos/users/following';
import { GetUserPostsDto } from '@/dtos/users/posts';
import { db } from '@/helpers/db';
import requireAuthorization from '@/middlewares/authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import { User } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';

export const GET = async (
  req: FastifyRequest<{ Params: { handle: string }; Querystring: { type: 'posts' | 'replies'; page: string; limit: string } }>,
  reply: FastifyReply
) => {
  const { params } = req;
  const { page, type, limit } = req.query;
  const authData = await requireAuthorization(req);

  const [validatedPage, validatedLimit, validatedType] = await Promise.all([
    FollowingPageDto.safeParseAsync(Number(page)),
    FollowingLimitDto.safeParseAsync(Number(limit)),
    GetUserPostsDto.safeParseAsync(type)
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

  if (!validatedType.success) {
    return reply.status(400).send({
      error: validatedType.error.errors[0].message
    });
  }

  let user: User | null = null;
  let userWhoRequested: User | null = null;

  if (params.handle === '@me') {
    if (!authData.authorized) return authData.response;

    user = await getUserByEmail(authData.email);
    userWhoRequested = user;
    if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });
  }

  if (!user) user = await getUserByHandle(params.handle);
  if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

  if (user.private) {
    // TODO: implement private user profile
    return reply.status(404).send({ error: 'user_is_private', message: 'User account is private.' });
  }

  const { posts } = await db.user.findFirstOrThrow({
    where: {
      handle: user.handle
    },
    include: {
      posts: {
        where: {
          // if postType is posts, we want to get all posts
          // if postType is replies, we want to get all replies
          parentId: validatedType.data === 'posts' ? null : { not: null }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: validatedLimit.data,
        skip: (validatedPage.data - 1) * validatedLimit.data
      }
    }
  });

  return reply.status(200).send(
    posts.map((post) => ({
      ...post,
      authorId: undefined,
      likedIds: undefined,
      likeCount: post.likedIds.length,
      hasLiked: userWhoRequested ? post.likedIds.includes(userWhoRequested.id) : false
    }))
  );
};
