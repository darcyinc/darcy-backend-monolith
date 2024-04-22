import { db } from '@/helpers/db';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { getUserByEmail } from '@/services/users';
import { z } from 'zod';

export async function likePost(app: AppInstance) {
  app.post(
    '/:postId/like',
    {
      onRequest: [enforceAuthorization] as never,
      schema: {
        params: z.object({
          postId: z.string()
        })
      }
    },
    async (request, reply) => {
      const { params } = request;
      const { authorized, email } = request.authorization;

      if (!authorized) return;

      const user = await getUserByEmail(email);
      if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

      const post = await db.post.findUnique({
        where: {
          id: params.postId
        }
      });
      if (!post) return reply.status(404).send({ error: 'post_not_found', message: 'Post not found.' });

      if (post.likedIds.includes(user.id))
        return reply.status(400).send({ error: 'already_liked', message: 'You already liked this post.' });

      await db.post.update({
        where: {
          id: params.postId
        },
        data: {
          likedIds: {
            push: user.id
          }
        }
      });

      return reply.status(204).send();
    }
  );
}

export async function unlikePost(app: AppInstance) {
  app.delete(
    '/:postId/like',
    {
      onRequest: [enforceAuthorization] as never,
      schema: {
        params: z.object({
          postId: z.string()
        })
      }
    },
    async (request, reply) => {
      const { params } = request;
      const { authorized, email } = request.authorization;

      if (!authorized) return;

      const user = await getUserByEmail(email);
      if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

      const post = await db.post.findUnique({
        where: {
          id: params.postId
        }
      });
      if (!post) return reply.status(404).send({ error: 'post_not_found', message: 'Post not found.' });

      if (!post.likedIds.includes(user.id)) return reply.status(400).send({ error: 'not_liked', message: 'You have not liked this post.' });

      await db.post.update({
        where: {
          id: params.postId
        },
        data: {
          likedIds: {
            set: post.likedIds.filter((id) => id !== user.id)
          }
        }
      });

      return reply.status(204).send();
    }
  );
}
