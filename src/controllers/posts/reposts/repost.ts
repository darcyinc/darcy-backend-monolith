import { RepostPostDto } from '@/dtos/posts/repost-post';
import { db } from '@/helpers/db';
import { badRequest, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
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
      if (!request.authorization.authorized) return unauthorized(reply);

      const data = request.body;

      const post = await db.post.findUnique({
        where: {
          id: request.params.postId,
          deleted: false
        },
        include: {
          author: true
        }
      });

      if (!post) return badRequest(reply, 'unknown_post', 'Unknown post.');
      if (post.author.privacy === 'PRIVATE') return badRequest(reply, 'cannot_repost_private_post', 'Cannot repost private post.');

      const alreadyReposted = await db.post.findFirst({
        where: {
          authorId: request.authorization.user.id,
          repostingPostId: post.id
        }
      });

      if (alreadyReposted) return badRequest(reply, 'already_reposted', 'Already reposted.');

      await db.$transaction([
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
        db.post.create({
          data: {
            authorId: request.authorization.user.id,
            repostingPostId: post.id,
            content: data.content ?? '',
            mediaUrls: data.mediaUrls
          }
        })
      ]);

      noContent(reply);
    }
  );
}
