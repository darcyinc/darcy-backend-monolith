import { db } from '@/helpers/db';
import { signToken } from '@/helpers/jwt';
import { getDiscordToken, getDiscordUserData } from '@/helpers/oauth/discord';
import generateHandleFromEmail from '@/helpers/oauth/generateHandle';
import { badRequest, ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { z } from 'zod';

export async function discordCallback(app: AppInstance) {
  app.post(
    '/discord/callback',
    {
      schema: {
        body: z.object({
          code: z.string()
        })
      }
    },
    async (request, reply) => {
      try {
        const discordToken = await getDiscordToken(request.body.code);
        const userData = await getDiscordUserData(discordToken);

        if (!userData.email || !userData.verified) {
          return badRequest(reply, 'no_email_associated', 'No email associated with account in selected provider');
        }

        const userAuth = await db.userAuth.upsert({
          where: {
            email: userData.email
          },
          create: {
            email: userData.email,
            user: {
              create: {
                displayName: userData.username,
                handle: generateHandleFromEmail(userData.email)
              }
            }
          },
          update: {}
        });

        const token = await signToken({ email: userAuth.email, updatedAt: userAuth.updatedAt.getTime() });

        ok(reply, { token });
      } catch {
        return badRequest(reply, 'invalid_token', 'Invalid token');
      }
    }
  );
}
