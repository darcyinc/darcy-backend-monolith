import { verifyToken } from '@/helpers/jwt';
import { FastifyReply, FastifyRequest } from 'fastify';

export default async function requireAuthorization(request: FastifyRequest, reply: FastifyReply) {
  const encodedToken = request.cookies.darcy_token;

  if (!encodedToken) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }

  const validToken = await verifyToken(encodedToken);

  if (!validToken) {
    return reply.status(401).send({ error: 'Unauthorized' });
  }
}
