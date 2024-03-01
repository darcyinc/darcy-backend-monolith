import { z } from 'zod';

export const AuthCallbackDto = z.object({
  code: z.string().min(1)
});
