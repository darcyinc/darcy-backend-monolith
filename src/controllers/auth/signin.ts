import { LoginAccountDto } from '@/dtos/auth/login-account';
import { db } from '@/helpers/db';
import { badRequest, ok, unauthorized } from '@/helpers/response';
import { createSession } from '@/helpers/sessions';
import type { AppInstance } from '@/index';
import { verifyCaptcha } from '@/utils/captcha';
import { verify } from 'argon2';

export async function signin(app: AppInstance) {
  app.post(
    '/signin',
    {
      schema: {
        body: LoginAccountDto
      },
      onRequest: [] as never
    },
    async (request, reply) => {
      const { email, password, captchaToken } = request.body;

      const isCaptchaSuccess = await verifyCaptcha(captchaToken);
      if (!isCaptchaSuccess) return badRequest(reply, 'incorrect_captcha_or_timeout', 'Incorrect captcha or timeout. Please, try again.');

      const user = await db.userAuth.findFirst({
        where: {
          email: {
            equals: email,
            mode: 'insensitive'
          }
        }
      });

      if (!user) return unauthorized(reply, 'unknown_user_or_incorrect_password', 'Unknown user or incorrect password.');

      const isValid = await verify(user.passwordHash, password);
      if (!isValid) return unauthorized(reply, 'unknown_user_or_incorrect_password', 'Unknown user or incorrect password.');

      const session = await createSession({
        userId: user.userId,
        userAgent: request.headers['user-agent'] ?? 'unknown'
      });

      ok(reply, {
        access_token: session.accessToken,
        refresh_token: session.refreshToken
      });
    }
  );
}
