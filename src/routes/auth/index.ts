import * as DiscordOauthController from '@/controllers/auth/discord-callback';
import { FastifyInstance } from 'fastify';

export default function authRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.post('/discord/callback', DiscordOauthController.POST);

  done();
}
