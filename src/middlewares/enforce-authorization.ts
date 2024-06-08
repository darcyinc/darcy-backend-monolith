import { unauthorized } from '@/helpers/response';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { optionalAuthorization } from './optional-authorization';

export async function enforceAuthorization(request: FastifyRequest, reply: FastifyReply) {
  if (!request.authorization) {
    await optionalAuthorization(request);
  }

  if (!request.authorization.authorized) return unauthorized(reply);
}
