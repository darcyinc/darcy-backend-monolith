import { db } from '@/helpers/db';
import { badRequest, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { object, string } from 'zod';

export async function deleteRepost(app: AppInstance) {
  app.delete(
    '/:postId/repost',
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

      const alreadyReposted = await db.post.findFirst({
        where: {
          authorId: request.authorization.user.id,
          repostingPostId: post.id
        }
      });

      if (!alreadyReposted) return badRequest(reply, 'unknown_repost', 'Unknown repost.');

      await db.post.delete({
        where: {
          id: alreadyReposted.id
        }
      });

      noContent(reply);
    }
  );
}
