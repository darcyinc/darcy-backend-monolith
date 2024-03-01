import * as PostController from '@/controllers/post';
import { FastifyInstance } from 'fastify';

export default function postRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.get('/', PostController.POST);
  done();
}
