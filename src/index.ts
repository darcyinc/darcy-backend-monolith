import cors from '@fastify/cors';
import fastify from 'fastify';
import { registerRoutes } from './helpers/registerRoutes';

const app = fastify();

app.register(cors, { origin: 'http://localhost:3001' });
registerRoutes(app);

await app.listen({ host: '0.0.0.0', port: 3000 });

console.log('Listening on port 3000');
