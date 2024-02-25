import { FastifyInstance } from 'fastify';
import * as UsersController from '@/controllers/users';

export default function userRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.get('/:id', UsersController.getUserById);
  done();
}
