import { db } from '@/helpers/db';
import { badRequest, noContent, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { object, string } from 'zod';

export async function removePostLike(app: AppInstance) {
  app.delete(
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
          id: request.params.postId,
          deleted: false
        },
        include: {
          author: true
        }
      });

      if (!post) return badRequest(reply, 'unknown_post', 'Unknown post.');

      if (post.author.privacy === 'PRIVATE') {
        const isFollowing = await db.userFollow.findUnique({
          where: {
            followerId_targetId: {
              followerId: request.authorization.user.id,
              targetId: post.authorId
            }
          }
        });

        if (!isFollowing) return badRequest(reply, 'unknown_post', 'Unknown post.');
      }

      const alreadyLiked = await db.postLike.findUnique({
        where: {
          postId_userId: {
            postId: post.id,
            userId: request.authorization.user.id
          }
        }
      });

      if (!alreadyLiked) return badRequest(reply, 'post_not_liked', 'Post not liked by user');

      await db.$transaction([
        db.post.update({
          where: {
            id: post.id
          },
          data: {
            likesCount: {
              decrement: 1
            }
          }
        }),
        db.postLike.delete({
          where: {
            id: alreadyLiked.id
          }
        })
      ]);

      noContent(reply);
    }
  );
}
