import * as UsersController from '@/controllers/users';
import type { AppInstance } from '@/index';

export async function userRouter(app: AppInstance) {
  app.register(UsersController.getUser);
  app.register(UsersController.getUserFollowing);
  app.register(UsersController.getUserFollowers);
  app.register(UsersController.getUserPosts);
  app.register(UsersController.editUser);
  app.register(UsersController.followUser);
  app.register(UsersController.unfollowUser);
}
