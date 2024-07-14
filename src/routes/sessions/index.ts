import * as SessionsController from '@/controllers/sessions';
import type { AppInstance } from '@/index';

export async function sessionsRouter(app: AppInstance) {
  app.register(SessionsController.deleteSession);
  app.register(SessionsController.listSelfSessions);
  app.register(SessionsController.refreshSession);
}
