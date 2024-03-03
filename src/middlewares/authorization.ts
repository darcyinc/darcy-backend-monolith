import { decodeToken } from '@/helpers/jwt';
import { FastifyRequest } from 'fastify';

interface UnauthorizedResponse {
  authorized: false;
  response: Response;
}

interface AuthorizedResponse {
  authorized: true;
  email: string;
}

type AuthorizationResponse = AuthorizedResponse | UnauthorizedResponse;

export default async function requireAuthorization(request: FastifyRequest): Promise<AuthorizationResponse> {
  const [type, encodedToken] = request.headers.authorization?.split(' ') ?? [];

  if (!type || type !== 'Bearer' || !encodedToken) {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    };
  }

  try {
    const validToken = await decodeToken(encodedToken);

    if (!validToken || !validToken.email || !validToken.updatedAt) {
      return {
        authorized: false,
        response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        })
      };
    }

    return {
      authorized: true,
      email: validToken.email
    };
  } catch {
    return {
      authorized: false,
      response: new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json'
        }
      })
    };
  }
}
