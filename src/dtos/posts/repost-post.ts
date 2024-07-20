import { array, object, string } from 'zod';

export const RepostPostDto = object({
  content: string({ message: 'Content must be a string' })
    .max(1024, {
      message: 'Content must be less than 1024 characters'
    })
    .optional(),
  mediaUrls: array(
    string({
      message: 'Media URLs must be an array of strings'
    })
  )
    .min(0)
    .max(4, { message: 'Media URLs must be less than 4' })
    .optional()
    .default([])
});
