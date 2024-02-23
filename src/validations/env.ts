import { z } from 'zod';

export const env = z
  .object({
    JWT_SECRET: z.string().min(1),
    DATABASE_URL: z.string().min(1)
  })
  .parse(process.env);
