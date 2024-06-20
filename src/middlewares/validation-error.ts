import { internalServerError } from '@/helpers/response';
import { ZodError } from 'zod';
import type { AppInstance } from '..';

export const validationErrorHandler: AppInstance['errorHandler'] = (error, _request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      error: error.errors[0].message
    });
    return;
  }

  console.log(error)

  return internalServerError(reply);
};
