import * as AuthController from '@/controllers/auth';
import type { AppInstance } from '@/index';

export async function authRouter(app: AppInstance) {
  app.register(AuthController.signin);
  app.register(AuthController.signup);
}
