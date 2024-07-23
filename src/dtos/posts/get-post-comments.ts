import { object, string } from 'zod';

export const GetPostCommentsDto = object({
  limit: string({ message: 'Limit must be a string' })
    .optional()
    .default('10')
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'Limit must be a numberic string'
    })
    .refine((value) => Number(value) >= 1 && Number(value) <= 30, {
      message: 'Limit must be between 1 and 30'
    })
    .transform((value) => Number(value)),
  page: string({ message: 'Page must be a string' })
    .optional()
    .default('1')
    .refine((value) => !Number.isNaN(Number(value)), {
      message: 'Page must be a numberic string'
    })
    .refine((value) => Number(value) >= 1, {
      message: 'Page must be greater than 1'
    })
    .transform((value) => Number(value))
});
