import * as UsersController from '@/controllers/users';
import { FastifyInstance } from 'fastify';

export default function userRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.get('/:handle', UsersController.get);
  done();
}
