import { z } from 'zod';

export const AuthCallbackDto = z.object({
  code: z.string().min(1)
});

export interface DiscordTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  error?: string;
}

export interface DiscordUserData {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
}
