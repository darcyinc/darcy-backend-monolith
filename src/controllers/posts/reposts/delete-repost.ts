import { db } from '@/helpers/db';
import { badRequest, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { deletePost, getPostById } from '@/services/posts/post';
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
      const { postId } = request.params;

      if (!request.authorization.authorized) return unauthorized(reply);

      const post = await getPostById({ postId, ignoreDeleted: true });
      if (!post) return badRequest(reply, 'unknown_post', 'Unknown post');

      const alreadyReposted = await db.post.findFirst({
        where: {
          authorId: request.authorization.user.id,
          repostingPostId: post.id
        }
      });

      if (!alreadyReposted) return badRequest(reply, 'post_not_reposted', 'Post not reposted');

      await deletePost({ id: alreadyReposted.id, authorId: request.authorization.user.id });

      noContent(reply);
    }
  );
}
