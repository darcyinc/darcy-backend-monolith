import { z } from 'zod';

export const UserHandleDto = z
  .string()
  .min(2, { message: 'Handle must be at least 2 characters long' })
  .max(16, { message: 'Handle must be at most 16 characters long' })
  .regex(/^[a-zA-Z0-9_]+$/, { message: 'Handle can only contain letters, numbers, and underscores' });

export const PatchUserDto = z.object({
  displayName: z
    .string()
    .min(1, {
      message: 'Display name must be at least 1 character long'
    })
    .max(32, {
      message: 'Display name must be at most 32 characters long'
    })
    .optional(),
  bio: z
    .string()
    .max(120, {
      message: 'Bio must be at most 120 characters long'
    })
    .optional(),
  handle: UserHandleDto.optional(),
  completedOnboarding: z.boolean().optional()
});
