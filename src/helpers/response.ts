import type { FastifyReply } from 'fastify';

export const badRequest = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(400).send({
    success: false,
    error: {
      id: errorId ?? 'bad_request',
      message: errorMessage ?? 'Bad request',
      ...data
    }
  });
};

export const conflict = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(409).send({
    success: false,
    error: {
      id: errorId ?? 'conflict',
      message: errorMessage ?? 'Server conflict',
      ...data
    }
  });
};

export const ok = (reply: FastifyReply, data?: unknown) => {
  reply.status(200).send({
    success: true,
    data
  });
};

export const created = (reply: FastifyReply, data?: unknown) => {
  reply.status(201).send({
    success: true,
    data
  });
};

export const internalServerError = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(500).send({
    success: false,
    error: {
      id: errorId ?? 'internal_server_error',
      message: errorMessage ?? 'Internal server error',
      ...data
    }
  });
};

export const noContent = (reply: FastifyReply) => {
  reply.status(204).send();
};

export const notFound = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(404).send({
    success: false,
    error: {
      id: errorId ?? 'not_found',
      message: errorMessage ?? 'Entity or route not found',
      ...data
    }
  });
};

export const unauthorized = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(401).send({
    success: false,
    error: {
      id: errorId ?? 'unauthorized',
      message: errorMessage ?? 'You must be authorized or authenticated to perform this action',
      ...data
    }
  });
};

export const forbidden = (reply: FastifyReply, errorId?: string, errorMessage?: string, data?: Record<string, unknown>) => {
  reply.status(403).send({
    success: false,
    error: {
      id: errorId ?? 'forbidden',
      message: errorMessage ?? 'You do not have permission to perform this action',
      ...data
    }
  });
};
