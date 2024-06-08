import { CreatePostDto } from '@/dtos/post';
import { db } from '@/helpers/db';
import { created, forbidden, notFound, ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getUserByEmail } from '@/services/users';
import { z } from 'zod';

export * from './comments';
export * from './like';

export async function getPost(app: AppInstance) {
  app.get(
    '/:postId',
    {
      onRequest: [optionalAuthorization] as never,
      schema: {
        params: z.object({
          postId: z.string()
        })
      }
    },
    async (request, reply) => {
      const { params } = request;
      const { authorized, email } = request.authorization;

      const post = await db.post.findUnique({
        where: {
          id: params.postId
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
        }
      });

      if (!post) {
        return notFound(reply, 'post_not_found', 'Post not found.');
      }

      if (post.author.private) {
        if (!authorized) return unauthorized(reply);
        return forbidden(reply, 'get_post_private', 'This post is private. You must follow the user to see it.');
      }

      let hasLiked = false;

      if (authorized) {
        const user = await getUserByEmail(email);
        if (!user) return notFound(reply, 'user_not_found', 'User not found.');
        hasLiked = post.likedIds.includes(user.id);
      }

      return ok(reply, {
        ...post,
        commentCount: post.comments.length,
        authorId: undefined,
        likedIds: undefined,
        likeCount: post.likedIds.length,
        hasLiked
      });
    }
  );
}

export async function createPost(app: AppInstance) {
  app.post(
    '/',
    {
      onRequest: [enforceAuthorization] as never,
      schema: {
        body: CreatePostDto
      }
    },
    async (request, reply) => {
      const { body } = request;
      const { authorized, email } = request.authorization;

      if (!authorized) return;

      const user = await getUserByEmail(email);
      if (!user) return notFound(reply, 'user_not_found', 'User not found.');

      const parentPostId = body.parentId;

      if (parentPostId) {
        const parentPost = await db.post.findUnique({
          where: {
            id: parentPostId
          }
        });

        if (!parentPost) return notFound(reply, 'parent_post_not_found', 'Parent post not found.');
      }

      const post = await db.post.create({
        data: {
          authorId: user.id,
          parentId: parentPostId,
          content: body.content
        },
        include: {
          comments: true,
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

      return created(reply, {
        ...post,
        commentCount: post.comments.length,
        likedIds: undefined,
        likeCount: 0,
        hasLiked: false
      });
    }
  );
}
