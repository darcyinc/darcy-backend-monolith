import { PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';
import type { AppInstance } from '..';

export const validationErrorHandler: AppInstance['errorHandler'] = (error, _request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      error: error.errors[0].message
    });
    return;
  }

  if (error instanceof PrismaClientInitializationError) {
    reply.status(500).send({
      error: 'prisma_client_initialization_error'
    });
    return;
  }

  reply.status(500).send({
    error: 'Internal Server Error'
  });
};
