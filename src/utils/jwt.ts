import { env } from '@/validations/env';
import jwt from 'jsonwebtoken';

const secret = env.JWT_TOKEN;

interface SignOptions {
  expiresIn?: string;
}

export const signToken = <T extends Record<string, unknown>>(payload: T, { expiresIn } = {} as SignOptions) => {
  return new Promise<string>((resolve, reject) => {
    jwt.sign(payload, secret, { issuer: 'learnforfree-sessions', expiresIn: expiresIn ?? '60d' }, (err, token) => {
      if (err) reject(err);
      else resolve(token as string);
    });
  });
};

export const verifyToken = <T>(token: string, ignoreExpiration = false): Promise<T> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      secret,
      {
        ignoreExpiration,
        issuer: 'learnforfree-sessions'
      },
      (err, payload) => {
        if (err) reject(err);
        else resolve(payload as T);
      }
    );
  });
};
