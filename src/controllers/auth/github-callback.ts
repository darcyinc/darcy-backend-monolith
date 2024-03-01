import { AuthCallbackDto } from '@/dtos/auth/callback';
import { db } from '@/helpers/db';
import { signToken } from '@/helpers/jwt';
import generateHandleFromEmail from '@/helpers/oauth/generateHandle';
import { getGithubToken, getGithubUserData } from '@/helpers/oauth/github';
import { FastifyReply, FastifyRequest } from 'fastify';

export const POST = async (req: FastifyRequest<{ Body: { code: string } }>, reply: FastifyReply) => {
  const validatedCode = await AuthCallbackDto.safeParseAsync(req.body);

  if (!validatedCode.success) {
    return reply.status(400).send({
      error: validatedCode.error.errors[0].message
    });
  }

  try {
    const discordToken = await getGithubToken(validatedCode.data.code);
    const userData = await getGithubUserData(discordToken);

    if (!userData.email) {
      return reply.status(400).send({
        error: 'no_email_associated',
        message: 'No email associated with account in selected provider'
      });
    }

    let token = '';
    const existingUser = await db.userAuth.findFirst({ where: { email: userData.email } });

    if (existingUser) {
      token = await signToken({ email: userData.email, updatedAt: existingUser.updatedAt.getTime() });
    } else {
      const newUser = await db.user.create({
        data: {
          auth: {
            create: {
              email: userData.email
            }
          },
          displayName: userData.name ?? userData.login,
          handle: generateHandleFromEmail(userData.email),
          location: userData.location,
          websiteUrl: userData.blog
        },
        include: {
          auth: true
        }
      });

      if (!newUser.auth) {
        throw new Error();
      }

      token = await signToken({ email: newUser.auth.email, updatedAt: newUser.auth.updatedAt.getTime() });
    }

    reply.send({
      token
    });
  } catch {
    reply.status(400).send({
      error: 'invalid_token',
      message: 'Invalid token'
    });
  }
};
