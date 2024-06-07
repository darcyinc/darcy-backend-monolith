import type { FastifyReply } from 'fastify';

interface ResponseOptions {
  data?: unknown;
  reply: FastifyReply;
}

export const badRequest = ({ data, reply }: ResponseOptions) => {
  reply.status(400);
  if (data) return reply.send(data);

  return reply.send({
    error: 'bad_request',
    message: 'Bad request'
  });
};

export const conflict = ({ data, reply }: ResponseOptions) => {
  reply.status(409);
  if (data) return reply.send(data);

  return reply.send({
    error: 'conflict',
    message: 'Entity already exists'
  });
};

export const ok = ({ data, reply }: ResponseOptions) => {
  reply.status(200).send(data);
};

export const created = ({ reply }: ResponseOptions) => {
  reply.status(201);
};

export const notFound = ({ data, reply }: ResponseOptions) => {
  reply.status(404);
  if (data) return reply.send(data);

  return reply.send({
    error: 'not_found',
    message: 'Entity or route not found'
  });
};

export const unauthorized = ({ data, reply }: ResponseOptions) => {
  reply.status(401);
  if (data) return reply.send(data);

  return reply.send({
    error: 'unauthorized',
    message: 'You must be authorized or authenticated to perform this action'
  });
};

export const noPermission = ({ data, reply }: ResponseOptions) => {
  reply.status(403);
  if (data) return reply.send(data);

  return reply.send({
    error: 'no_permission',
    message: 'You do not have permission to perform this action'
  });
};
