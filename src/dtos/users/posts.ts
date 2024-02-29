import { z } from 'zod';

export const GetUserPostsDto = z.string().regex(/^(posts|replies)$/).default('posts');