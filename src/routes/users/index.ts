import * as UsersController from '@/controllers/users';
import type { AppInstance } from '@/index';

export async function usersRouter(app: AppInstance) {
  app.register(UsersController.getSelfUser);
  app.register(UsersController.getUserByHandle);
}
