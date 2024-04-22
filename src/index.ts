import cors from '@fastify/cors';
import fastify from 'fastify';
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from 'fastify-type-provider-zod';
import { registerRoutes } from './helpers/registerRoutes';
import { validationErrorHandler } from './middlewares/validation-error';

export type AppInstance = typeof app;

const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);
app.setErrorHandler(validationErrorHandler);

app.register(registerRoutes);
app.register(cors, { origin: 'http://localhost:3001' });

await app.listen({ host: '0.0.0.0', port: 3000 });

console.log('Listening on port 3000');


