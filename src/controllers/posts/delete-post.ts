import { badRequest, forbidden, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { deletePost as deletePostService, getPostById } from '@/services/posts/post';
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

      const post = await getPostById({ postId: request.params.postId, ignoreDeleted: true });
      if (!post) return badRequest(reply, 'unknown_post', 'Unknown post');

      if (post.authorId !== request.authorization.user.id) return forbidden(reply);

      await deletePostService({ id: post.id, authorId: post.authorId });

      noContent(reply);
    }
  );
}
