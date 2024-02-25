import userRouter from '@/routes/users';
import { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance) {
  app.register(userRouter, { prefix: '/users' });
}
