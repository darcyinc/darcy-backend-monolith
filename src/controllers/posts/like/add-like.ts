import { db } from '@/helpers/db';
import { badRequest, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { object, string } from 'zod';

export async function addPostLike(app: AppInstance) {
  app.post(
    '/:postId/like',
    {
      schema: {
        params: object({
          postId: string()
        })
      },
      onRequest: [enforceAuthorization] as never
    },
    async (request, reply) => {
      if (!request.authorization.authorized) return unauthorized(reply);

      const post = await db.post.findUnique({
        where: {
          id: request.params.postId
        }
      });

      if (!post) return badRequest(reply, 'unknown_post', 'Unknown post.');

      const alreadyLiked = await db.postLike.findFirst({
        where: {
          userId: request.authorization.user.id,
          postId: post.id
        }
      });

      if (alreadyLiked) return badRequest(reply, 'post_already_liked', 'Post was already liked by user');

      await db.$transaction([
        db.post.update({
          where: {
            id: post.id
          },
          data: {
            likesCount: {
              increment: 1
            }
          }
        }),
        db.postLike.create({
          data: {
            userId: request.authorization.user.id,
            postId: post.id
          }
        })
      ]);

      noContent(reply);
    }
  );
}
