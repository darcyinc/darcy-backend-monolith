// import { db } from '@/helpers/db';
import cookie from '@fastify/cookie';
import fastify from 'fastify';
import cors from '@fastify/cors';
import { registerRoutes } from './helpers/registerRoutes';

const app = fastify();

app.register(cookie);
app.register(cors, { origin: 'http://localhost:3001' });
registerRoutes(app);

// await db.$connect();
await app.listen({ host: '0.0.0.0', port: 3000 });

console.log('Listening on port 3000');
