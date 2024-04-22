import { z } from 'zod';

export const GetUserPostsDto = z
  .string()
  .regex(/^(posts|replies)$/, 'Type must be "posts" or "replies"')
  .default('posts');
