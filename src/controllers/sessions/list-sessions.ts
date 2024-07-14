import { db } from '@/helpers/db';
import { ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';

export async function listSelfSessions(app: AppInstance) {
  app.get(
    '/',
    {
      onRequest: [enforceAuthorization] as never
    },
    async (request, reply) => {
      if (!request.authorization.authorized) return unauthorized(reply);

      const sessions = await db.session.findMany({
        where: {
          userId: request.authorization.user.id
        }
      });

      ok(
        reply,
        sessions.map((session) => ({
          id: session.id,
          user_agent: session.userAgent,
          created_at: session.createdAt,
          expired: session.expiresAt.getTime() < Date.now(),
          used_in_this_request: request.authorization.session?.id ?? '' === session.id
        }))
      );
    }
  );
}
