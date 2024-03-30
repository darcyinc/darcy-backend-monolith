import * as PostController from '@/controllers/post';
import * as PostCommentController from '@/controllers/post/comments';
import * as PostLikeController from '@/controllers/post/like';
import type { FastifyInstance } from 'fastify';

export default function postRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.post('/', PostController.POST);
  fastify.get('/:postId', PostController.GET);
  fastify.get('/:postId/comments', PostCommentController.GET);

  fastify.post('/:postId/like', PostLikeController.POST);
  fastify.delete('/:postId/like', PostLikeController.DELETE);
  done();
}
