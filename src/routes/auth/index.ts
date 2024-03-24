import * as DiscordOauthController from '@/controllers/auth/discord-callback';
import * as GithubOauthController from '@/controllers/auth/github-callback';
import type { FastifyInstance } from 'fastify';

export default function authRouter(fastify: FastifyInstance, _: unknown, done: () => void) {
  fastify.post('/discord/callback', DiscordOauthController.POST);
  fastify.post('/github/callback', GithubOauthController.POST);

  done();
}
