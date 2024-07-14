import * as StatusController from '@/controllers/status';
import type { AppInstance } from '@/index';

export async function statusRouter(app: AppInstance) {
  app.register(StatusController.hello);
}
