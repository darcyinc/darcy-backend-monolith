import { FastifyReply, FastifyRequest } from 'fastify';

export const getUserById = (_req: FastifyRequest, reply: FastifyReply) => {
  reply.send('Hello world');
};
