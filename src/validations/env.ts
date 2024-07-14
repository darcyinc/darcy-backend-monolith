import { z } from 'zod';

export const env = z
  .object({
    DATABASE_URL: z.string().min(1).default('postgresql://darcy:darcy@localhost:5432/darcy'),
    WEBSITE_URL: z.string().min(1).default('http://localhost:3000'),
    // why not enforce a minimum length of 10 for safety purposes :)
    JWT_TOKEN: z.string().min(10),
    GOOGLE_CAPTCHA_V3_KEY: z.string().min(1)
  })
  .parse(process.env);
