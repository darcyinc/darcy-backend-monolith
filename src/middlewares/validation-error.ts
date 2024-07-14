import { badRequest, internalServerError } from '@/helpers/response';
import { ZodError } from 'zod';
import type { AppInstance } from '..';

export const validationErrorHandler: AppInstance['errorHandler'] = (error, _request, reply) => {
  if (error instanceof ZodError) {
    return badRequest(reply, 'validation_error', error.errors[0].message);
  }

  console.log(error);

  return internalServerError(reply);
};
