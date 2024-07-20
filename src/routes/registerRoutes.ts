import type { AppInstance } from '..';
import { authRouter } from './auth';
import { postsRouter } from './posts';
import { sessionsRouter } from './sessions';
import { statusRouter } from './status';
import { usersRouter } from './users';

export async function registerRoutes(app: AppInstance) {
  app.register(authRouter, { prefix: '/auth' });
  app.register(sessionsRouter, { prefix: '/sessions' });
  app.register(statusRouter, { prefix: '/status' });
  app.register(usersRouter, { prefix: '/users' });
  app.register(postsRouter, { prefix: '/posts' });
}
