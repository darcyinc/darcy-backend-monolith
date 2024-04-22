import type { GithubTokenDto, GithubUserDto } from '@/dtos/auth/callback/github';
import { env } from '@/validations/env';

export const GITHUB_CALLBACK_URL = `${env.WEBSITE_URL}/auth/callback/github`;

const generateAuthParams = (code: string) => ({
  client_id: env.GITHUB_CLIENT_ID,
  client_secret: env.GITHUB_CLIENT_SECRET,
  redirect_uri: GITHUB_CALLBACK_URL,
  code
});

export const getGithubToken = async (code: string) => {
  const request = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(generateAuthParams(code))
  });
  const data = (await request.json()) as GithubTokenDto;

  if (data.error || !data.scope.includes('user:email')) {
    throw new Error('Invalid scope or an error ocurred.');
  }

  return data.access_token;
};

export const getGithubUserData = async (token: string) => {
  const request = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const data = (await request.json()) as GithubUserDto;

  return data;
};
