import * as PostController from '@/controllers/post';
import * as GetPostController from '@/controllers/post/get-post';
import * as LikePostController from '@/controllers/post/like';
import { FastifyInstance } from 'fastify';

export default function postRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.post('/', PostController.POST);
  fastify.get('/:postId', GetPostController.GET);

  fastify.post('/:postId/like', LikePostController.POST);
  fastify.delete('/:postId/like', LikePostController.DELETE);
  done();
}
