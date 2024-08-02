import { ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getAllRecentPosts } from '@/services/posts/posts';

// This route should only be available on the development phase, when releasing, remove it.
export async function getRecentPublicPosts(app: AppInstance) {
  app.get(
    '/recent',
    {
      schema: {},
      onRequest: [optionalAuthorization] as never
    },
    async (request, reply) => {
      const posts = await getAllRecentPosts({
        limit: 20,
        page: 1,
        userId: request.authorization.user?.id ?? undefined
      });

      ok(reply, posts);
    }
  );
}
