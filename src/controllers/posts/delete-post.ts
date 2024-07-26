import { db } from '@/helpers/db';
import { badRequest, forbidden, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { object, string } from 'zod';

export async function deletePost(app: AppInstance) {
  app.delete(
    '/:postId',
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
          id: request.params.postId,
          authorId: request.authorization.user.id
        }
      });

      if (!post || post.deleted) return badRequest(reply, 'unknown_post', 'Unknown post.');

      if (post.authorId !== request.authorization.user.id) return forbidden(reply);

      if (post.repliesCount === 0) {
        await db.post.delete({
          where: {
            id: request.params.postId
          }
        });
      } else {
        await db.$transaction([
          // Soft delete because we still want to keep replies alive
          db.post.update({
            where: {
              id: request.params.postId
            },
            data: {
              content: '',
              mediaUrls: [],
              likesCount: 0,
              repliesCount: 0,
              deleted: true
            }
          }),
          db.postLike.deleteMany({
            where: {
              postId: request.params.postId
            }
          }),
          db.post.deleteMany({
            where: {
              repostingPostId: request.params.postId
            }
          })
        ]);
      }

      noContent(reply);
    }
  );
}
