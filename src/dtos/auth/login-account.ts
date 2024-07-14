import { object, string } from 'zod';

export const LoginAccountDto = object({
  email: string({ message: 'Email must be a string' })
    .email({ message: 'Email must be a valid email' })
    .min(1, {
      message: 'Email is required'
    })
    .max(255, {
      message: 'Email must be less than 255 characters'
    }),
  password: string({ message: 'Password must be a string' })
    .min(1, {
      message: 'Password is required'
    })
    .max(30, {
      message: 'Password must be less than 30 characters'
    })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,30}$/, {
      message: 'Password must contain at least one number, one letter and one special character'
    }),
  captchaToken: string({ message: 'Captcha token must be a string' }).min(1)
});
