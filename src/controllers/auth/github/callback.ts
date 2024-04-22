import { db } from '@/helpers/db';
import { signToken } from '@/helpers/jwt';
import generateHandleFromEmail from '@/helpers/oauth/generateHandle';
import { getGithubToken, getGithubUserData } from '@/helpers/oauth/github';
import type { AppInstance } from '@/index';
import { z } from 'zod';

export async function githubCallback(app: AppInstance) {
  app.post(
    '/github/callback',
    {
      schema: {
        body: z.object({
          code: z.string()
        })
      }
    },
    async (request, reply) => {
      try {
        const discordToken = await getGithubToken(request.body.code);
        const userData = await getGithubUserData(discordToken);

        if (!userData.email) {
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
                displayName: userData.name ?? userData.login,
                handle: generateHandleFromEmail(userData.email),
                location: userData.location,
                websiteUrl: userData.blog
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
