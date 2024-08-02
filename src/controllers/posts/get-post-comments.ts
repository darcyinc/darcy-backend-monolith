import { GetPostCommentsDto } from '@/dtos/posts/get-post-comments';
import { notFound, ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getPostById } from '@/services/posts/post';
import { getPostComments as getPostCommentsService } from '@/services/posts/post-comments';
import { isFollowingUser } from '@/services/user';
import { object, string } from 'zod';

export async function getPostComments(app: AppInstance) {
  app.get(
    '/:postId/comments',
    {
      schema: {
        params: object({
          postId: string()
        }),
        querystring: GetPostCommentsDto
      },
      onRequest: [optionalAuthorization] as never
    },
    async (request, reply) => {
      const { postId } = request.params;
      const { limit, page, afterId } = request.query;

      const post = await getPostById({ postId, ignoreDeleted: true });
      if (!post) return notFound(reply, 'unknown_post', 'Unknown post');

      if (post.author.privacy === 'PRIVATE') {
        if (!request.authorization.authorized) return notFound(reply, 'unknown_post', 'Unknown post');

        const following = await isFollowingUser(request.authorization.user.id, post.authorId);
        if (!following) return notFound(reply, 'unknown_post', 'Unknown post');
      }

      const comments = await getPostCommentsService({
        postId,
        afterId,
        limit,
        page,
        requestedByUserId: request.authorization.user?.id
      });

      ok(reply, comments);
    }
  );
}
