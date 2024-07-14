import cors from '@fastify/cors';
import fastify from 'fastify';
import { type ZodTypeProvider, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { validationErrorHandler } from './middlewares/validation-error';
import { registerRoutes } from './routes/registerRoutes';
import { env } from './validations/env';

export type AppInstance = typeof app;

const app = fastify().withTypeProvider<ZodTypeProvider>();

app
  .setValidatorCompiler(validatorCompiler)
  .setSerializerCompiler(serializerCompiler)
  .setErrorHandler(validationErrorHandler)
  .register(registerRoutes, { prefix: '/api/v1' })
  .register(cors, { origin: env.WEBSITE_URL });

await app.listen({ host: '0.0.0.0', port: 4000 });

console.log('Listening on port 4000');
