import { z } from 'zod';

export const env = z
  .object({
    DATABASE_URL: z.string().min(1).default('postgresql://darcy:darcy@localhost:5432/darcy'),
    WEBSITE_URL: z.string().min(1).default('http://localhost:3000'),
    JWT_SECRET: z.string().min(1),
    // Oauth
    DISCORD_CLIENT_SECRET: z.string().min(1),
    DISCORD_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),
    GOOGLE_CLIENT_ID: z.string().min(1)
  })
  .parse(process.env);
