import { db } from '@/helpers/db';
import cookie from '@fastify/cookie';
import fastify from 'fastify';

// in development, DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://darcy:darcy@localhost:5432/darcy';
}

const app = fastify();

app.register(cookie);

await db.$connect();
await app.listen({ host: '0.0.0.0', port: 3000 });

console.log('Listening on port 3000');
