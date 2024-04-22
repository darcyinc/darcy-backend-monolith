import * as AuthController from '@/controllers/auth';
import type { AppInstance } from '@/index';

export async function authRouter(app: AppInstance) {
  app.register(AuthController.discordCallback);
  app.register(AuthController.githubCallback);
}
