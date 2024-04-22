import { authRouter, popularPostsRouter, postsRouter, userRouter } from '@/routes';
import type { AppInstance } from '..';

export async function registerRoutes(app: AppInstance) {
  app.register(authRouter, { prefix: '/auth' });
  app.register(userRouter, { prefix: '/users' });
  app.register(postsRouter, { prefix: '/post' });
  app.register(popularPostsRouter, { prefix: '/popular-posts' });
}
