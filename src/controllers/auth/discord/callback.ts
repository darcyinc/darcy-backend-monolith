import { db } from '@/helpers/db';
import { signToken } from '@/helpers/jwt';
import { getDiscordToken, getDiscordUserData } from '@/helpers/oauth/discord';
import generateHandleFromEmail from '@/helpers/oauth/generateHandle';
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
          return reply.status(400).send({
            error: 'no_email_associated',
            message: 'No email associated with account in selected provider'
          });
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

        reply.send({
          token
        });
      } catch {
        reply.status(400).send({
          error: 'invalid_token',
          message: 'Invalid token'
        });
      }
    }
  );
}
