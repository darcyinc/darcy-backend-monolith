import authRouter from '@/routes/auth';
import popularPostsRouter from '@/routes/popular-posts';
import postRouter from '@/routes/post';
import userRouter from '@/routes/users';
import type { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance) {
  app.register(authRouter, { prefix: '/auth' });
  app.register(userRouter, { prefix: '/users' });
  app.register(postRouter, { prefix: '/post' });
  app.register(popularPostsRouter, { prefix: '/popular-posts' });
}
