import { verifySession } from '@/helpers/sessions';
import type { Session, User } from '@prisma/client';
import type { FastifyRequest } from 'fastify';

interface Authorized {
  authorized: true;
  session: Session;
  user: User;
}

interface Unauthorized {
  authorized: false;
  session?: never;
  user?: never;
}

type Authorization = Authorized | Unauthorized;

declare module 'fastify' {
  interface FastifyRequest {
    authorization: Authorization;
  }
}

export async function optionalAuthorization(request: FastifyRequest) {
  const [type, accessToken] = request.headers.authorization?.split(' ') ?? [];

  request.authorization = {
    authorized: false
  };

  if (!type || type !== 'Bearer' || !accessToken || accessToken.length < 15) return;

  const session = await verifySession(accessToken);
  if (!session) return;

  request.authorization = {
    authorized: true,
    session: session,
    user: session.user
  };
}
