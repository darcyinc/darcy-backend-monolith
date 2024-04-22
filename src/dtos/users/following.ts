import { z } from 'zod';

export const FollowingPageDto = z
  .string()
  .regex(/^\d+$/)
  .optional()
  .default('1')
  .refine((page) => Number(page) >= 1, 'Page must be greater than 0')
  .transform((page) => Number(page));

export const FollowingLimitDto = z
  .string()
  .regex(/^\d+$/)
  .optional()
  .default('50')
  .refine((limit) => Number(limit) >= 1 && Number(limit) <= 50, 'Limit must be between 1 and 50')
  .transform((limit) => Number(limit));
