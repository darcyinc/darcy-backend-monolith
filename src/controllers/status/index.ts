import { ok } from '@/helpers/response';
import type { AppInstance } from '@/index';

export async function hello(app: AppInstance) {
  app.get(
    '/',
    {
      onRequest: [] as never
    },
    async (_request, reply) => {
      ok(reply, {
        hello: 'world'
      });
    }
  );
}
