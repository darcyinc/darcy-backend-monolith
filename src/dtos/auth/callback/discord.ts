export interface DiscordTokenDto {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  error?: string;
}

export interface DiscordUserDto {
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
