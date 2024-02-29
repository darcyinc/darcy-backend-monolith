import authRouter from '@/routes/auth';
import userRouter from '@/routes/users';
import { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance) {
  app.register(authRouter, { prefix: '/auth' });
  app.register(userRouter, { prefix: '/users' });
}
