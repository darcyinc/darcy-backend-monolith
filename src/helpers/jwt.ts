import { env } from '@/validations/env';
import jwt from 'jsonwebtoken';

interface TokenPayload {
  email: string;
  updatedAt: number;
}

export function signToken(data: TokenPayload) {
  return jwt.sign(data, env.JWT_SECRET, {
    issuer: 'darcy'
  });
}

export function verifyToken(token: string) {
  return jwt.verify(token, env.JWT_SECRET, {
    issuer: 'darcy'
  }) as TokenPayload;
}

export function decodeToken(token: string) {
  return jwt.decode(token) as TokenPayload;
}
