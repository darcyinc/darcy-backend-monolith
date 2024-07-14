import { env } from '@/validations/env';

export const verifyCaptcha = async (token: string) => {
  const response = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${env.GOOGLE_CAPTCHA_V3_KEY}&response=${token}`, {
    method: 'POST'
  });

  const data = await response.json();

  return data.success;
};
