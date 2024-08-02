import { RepostPostDto } from '@/dtos/posts/repost-post';
import { db } from '@/helpers/db';
import { badRequest, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { createPost, getPostById } from '@/services/posts/post';
import { object, string } from 'zod';

export async function repostPost(app: AppInstance) {
  app.post(
    '/:postId/repost',
    {
      schema: {
        body: RepostPostDto,
        params: object({
          postId: string()
        })
      },
      onRequest: [enforceAuthorization] as never
    },
    async (request, reply) => {
      const { postId } = request.params;
      const data = request.body;

      if (!request.authorization.authorized) return unauthorized(reply);

      const post = await getPostById({ postId, ignoreDeleted: true });
      if (!post) return badRequest(reply, 'unknown_post', 'Unknown post');
      if (post.author.privacy === 'PRIVATE')
        return badRequest(reply, 'cannot_repost_private_post', 'Cannot repost a post from a private account');

      const alreadyReposted = await db.post.findFirst({
        where: {
          authorId: request.authorization.user.id,
          repostingPostId: post.id
        }
      });

      if (alreadyReposted) return badRequest(reply, 'already_reposted', 'Already reposted');

      await Promise.all([
        db.post.update({
          where: {
            id: post.id
          },
          data: {
            repostsCount: {
              increment: 1
            }
          }
        }),
        createPost({
          authorId: request.authorization.user.id,
          repostingPostId: post.id,
          content: data.content ?? '',
          mediaUrls: data.mediaUrls,
          replyingToId: null,
          replyPrivacy: 'PUBLIC'
        })
      ]);

      noContent(reply);
    }
  );
}
