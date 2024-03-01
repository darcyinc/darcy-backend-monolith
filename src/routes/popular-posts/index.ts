import * as PopularPostsController from '@/controllers/popular-posts';
import { FastifyInstance } from 'fastify';

export default function popularPostsRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.get('/', PopularPostsController.GET);
  done();
}
