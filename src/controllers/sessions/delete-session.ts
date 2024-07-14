import { db } from '@/helpers/db';
import { notFound, ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { object, string } from 'zod';

export async function deleteSession(app: AppInstance) {
  app.delete(
    '/:id',
    {
      schema: {
        params: object({
          id: string({ message: 'Id must be a string' })
        })
      },
      onRequest: [enforceAuthorization] as never
    },
    async (request, reply) => {
      if (!request.authorization.authorized) return unauthorized(reply);

      const session = await db.session.findFirst({
        where: {
          id: request.params.id,
          userId: request.authorization.user.id
        }
      });

      if (!session) return notFound(reply, 'unknown_session');

      await db.session.delete({
        where: {
          id: session.id
        }
      });

      ok(reply);
    }
  );
}
