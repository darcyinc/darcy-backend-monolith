import { decodeToken } from '@/helpers/jwt';
import type { FastifyRequest } from 'fastify';

interface Authorized {
  authorized: true;
  email: string;
}

interface Unauthorized {
  authorized: false;
  email?: never;
}

type Authorization = Authorized | Unauthorized;

declare module 'fastify' {
  interface FastifyRequest {
    authorization: Authorization;
  }
}

export async function optionalAuthorization(request: FastifyRequest) {
  const [type, encodedToken] = request.headers.authorization?.split(' ') ?? [];
  request.authorization = {
    authorized: false
  };

  if (!type || type !== 'Bearer' || !encodedToken) return;

  try {
    const validToken = await decodeToken(encodedToken);

    if (!validToken || !validToken.email || !validToken.updatedAt) {
      return;
    }

    request.authorization = {
      authorized: true,
      email: validToken.email
    };
  } catch {
    return;
  }
}
