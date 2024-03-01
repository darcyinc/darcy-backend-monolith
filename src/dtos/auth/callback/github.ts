export interface GithubTokenDto {
  access_token: string;
  token_type: 'bearer';
  scope: string;
  error?: string;
}

export interface GithubUserDto {
  id: number;
  blog: string;
  name: string;
  login: string;
  email: string;
  location: string;
}