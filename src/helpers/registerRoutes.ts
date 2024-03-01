import authRouter from '@/routes/auth';
import popularPostsRouter from '@/routes/popular-posts';
import userRouter from '@/routes/users';
import { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance) {
  app.register(authRouter, { prefix: '/auth' });
  app.register(userRouter, { prefix: '/users' });
  app.register(popularPostsRouter, { prefix: '/popular-posts' });
}
