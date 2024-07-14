import { notFound, ok } from '@/helpers/response';
import { refreshSession as refreshSessionFunc } from '@/helpers/sessions';
import type { AppInstance } from '@/index';
import { object, string } from 'zod';

export async function refreshSession(app: AppInstance) {
  app.post(
    '/refresh',
    {
      schema: {
        body: object({
          accessToken: string({ required_error: 'Missing accessToken in body object' }),
          refreshToken: string({ required_error: 'Missing refreshToken in body object' })
        })
      },
      onRequest: [] as never
    },
    async (request, reply) => {
      const { accessToken, refreshToken } = request.body;

      const newSession = await refreshSessionFunc({
        accessToken,
        refreshToken,
        userAgent: request.headers['user-agent'] ?? 'unknown'
      });

      if (!newSession) return notFound(reply, 'unknown_session', 'Unknown session token or incorrect refresh token.');

      ok(reply, {
        access_token: newSession.accessToken,
        refresh_token: newSession.refreshToken
      });
    }
  );
}
