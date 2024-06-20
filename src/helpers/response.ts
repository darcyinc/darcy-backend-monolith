import type { FastifyReply } from 'fastify';

export const badRequest = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(400);

  if (errorId && errorMessage)
    return reply.send({
      success: false,
      statusCode: 400,
      error: {
        id: errorId,
        message: errorMessage,
        ...data
      }
    });

  return reply.send({
    success: false,
    statusCode: 400,
    error: {
      id: 'unknown',
      message: 'Unknown error'
    }
  });
};

export const conflict = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(409);

  if (errorId && errorMessage)
    return reply.send({
      success: false,
      statusCode: 409,
      error: {
        id: errorId,
        message: errorMessage,
        ...data
      }
    });

  return reply.send({
    success: false,
    statusCode: 409,
    error: {
      id: 'conflict',
      message: 'Server conflict'
    }
  });
};

export const ok = (reply: FastifyReply, data?: unknown) => {
  reply.status(200).send({
    success: true,
    statusCode: 200,
    data
  });
};

export const created = (reply: FastifyReply, data?: unknown) => {
  reply.status(201).send({
    success: true,
    statusCode: 201,
    data
  });
};

export const internalServerError = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(500);

  if (errorId && errorMessage)
    return reply.send({
      success: false,
      statusCode: 500,
      error: {
        id: errorId,
        message: errorMessage,
        ...data
      }
    });

  return reply.send({
    success: false,
    statusCode: 500,
    error: {
      id: 'internal_server_error',
      message: 'Internal server error'
    }
  });
};

export const noContent = (reply: FastifyReply) => {
  reply.status(204).send();
};

export const notFound = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(404);

  if (errorId && errorMessage)
    return reply.send({
      success: false,
      statusCode: 404,
      error: {
        id: errorId,
        message: errorMessage,
        ...data
      }
    });

  return reply.send({
    success: false,
    statusCode: 404,
    error: {
      id: 'not_found',
      message: 'Entity or route not found'
    }
  });
};

export const unauthorized = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(401);

  if (errorId && errorMessage)
    return reply.send({
      success: false,
      statusCode: 401,
      error: {
        id: errorId,
        message: errorMessage,
        ...data
      }
    });

  return reply.send({
    success: false,
    statusCode: 401,
    error: {
      id: 'unauthorized',
      message: 'You must be authorized or authenticated to perform this action'
    }
  });
};

export const forbidden = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(403);

  if (errorId && errorMessage)
    return reply.send({
      success: false,
      statusCode: 403,
      error: {
        id: errorId,
        message: errorMessage,
        ...data
      }
    });

  return reply.send({
    success: false,
    statusCode: 403,
    error: {
      id: 'forbidden',
      message: 'You do not have permission to perform this action'
    }
  });
};
