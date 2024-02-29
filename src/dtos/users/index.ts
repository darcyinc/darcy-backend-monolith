import { z } from 'zod';

export const UserHandleDto = z
  .string()
  .min(2)
  .max(16)
  .regex(/^[a-zA-Z0-9_]+$/);

export const PatchUserDto = z.object({
  displayName: z.string().min(1).max(32).optional(),
  bio: z.string().max(120).optional(),
  handle: UserHandleDto.optional()
});
