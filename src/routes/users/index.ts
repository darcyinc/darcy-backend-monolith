import * as UsersController from '@/controllers/users';
import * as FollowUsersController from '@/controllers/users/follow';
import * as FollowersUsersController from '@/controllers/users/followers';
import * as FollowingUsersController from '@/controllers/users/following';
import * as PostUsersController from '@/controllers/users/posts';
import type { FastifyInstance } from 'fastify';

export default function userRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.get('/:handle', UsersController.GET);
  fastify.patch('/:handle', UsersController.PATCH);

  fastify.get('/:handle/followers', FollowersUsersController.GET);
  fastify.get('/:handle/following', FollowingUsersController.GET);

  fastify.post('/:handle/follow', FollowUsersController.POST);
  fastify.delete('/:handle/follow', FollowUsersController.DELETE);

  fastify.get('/:handle/posts', PostUsersController.GET);
  done();
}
