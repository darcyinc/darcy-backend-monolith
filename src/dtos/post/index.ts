import { z } from 'zod';

export const CreatePostDto = z.object({
  content: z.string().min(1).max(256),
  parentId: z.string().optional()
});
