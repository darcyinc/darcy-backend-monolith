import { CreateAccountDto } from '@/dtos/auth/create-account';
import { db } from '@/helpers/db';
import { badRequest, ok } from '@/helpers/response';
import { createSession } from '@/helpers/sessions';
import type { AppInstance } from '@/index';
import { verifyCaptcha } from '@/utils/captcha';
import { generateRandomHandle } from '@/utils/generate-handle';
import { hash } from 'argon2';

export async function signup(app: AppInstance) {
  app.post(
    '/signup',
    {
      schema: {
        body: CreateAccountDto
      },
      onRequest: [] as never
    },
    async (request, reply) => {
      const { email, password, captchaToken, fullName } = request.body;

      const isCaptchaSuccess = await verifyCaptcha(captchaToken);
      if (!isCaptchaSuccess) return badRequest(reply, 'incorrect_captcha_or_timeout', 'Incorrect captcha or timeout. Please, try again.');

      const exists = await db.userAuth.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      });

      if (exists) return badRequest(reply, 'email_already_in_use', 'Email already in use.');

      const passwordHash = await hash(password);

      const userAuth = await db.userAuth.create({
        data: {
          email,
          passwordHash,
          user: {
            create: {
              fullName,
              handle: generateRandomHandle(email)
            }
          }
        }
      });

      const session = await createSession({
        userId: userAuth.userId,
        userAgent: request.headers['user-agent'] ?? 'unknown'
      });

      ok(reply, {
        access_token: session.accessToken,
        refresh_token: session.refreshToken
      });
    }
  );
}
