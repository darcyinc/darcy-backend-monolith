import type { DiscordTokenDto, DiscordUserDto } from '@/dtos/auth/callback/discord';
import { env } from '@/validations/env';

export const DISCORD_CALLBACK_URL = `${env.WEBSITE_URL}/auth/callback/discord`;

const generateAuthParams = (code: string) =>
  new URLSearchParams({
    client_id: env.DISCORD_CLIENT_ID,
    client_secret: env.DISCORD_CLIENT_SECRET,
    redirect_uri: DISCORD_CALLBACK_URL,
    grant_type: 'authorization_code',
    code
  });

export const getDiscordToken = async (code: string) => {
  const request = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: generateAuthParams(code)
  });
  const data = (await request.json()) as DiscordTokenDto;

  if (data.error || !data.scope.includes('identify') || !data.scope.includes('email')) {
    console.log(data, code);
    throw new Error('Invalid scope or an error ocurred.');
  }

  return data.access_token;
};

export const getDiscordUserData = async (token: string) => {
  const request = await fetch('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = (await request.json()) as DiscordUserDto;

  return data;
};
