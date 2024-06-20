import { z } from 'zod';

export const GetUserPostsDto = z
  .string()
  .regex(/^(posts|replies)$/, { message: 'Type must be "posts" or "replies"' })
  .optional()
  .default('posts');
