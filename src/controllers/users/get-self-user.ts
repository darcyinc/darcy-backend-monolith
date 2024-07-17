import { ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { getAllowedUserFields } from './get-user-by-handle';

export async function getSelfUser(app: AppInstance) {
  app.get(
    '/@me',
    {
      onRequest: [enforceAuthorization] as never
    },
    async (request, reply) => {
      if (!request.authorization.authorized) return unauthorized(reply);

      const user = request.authorization.user;

      const additionalFields: Record<string, unknown> = {
        is_following: false,
        is_self_user: true
      };

      ok(reply, {
        ...getAllowedUserFields(user),
        ...additionalFields
      });
    }
  );
}
