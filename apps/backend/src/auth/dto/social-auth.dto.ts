import { IsEnum, IsOptional, IsString } from 'class-validator';

export type SocialProvider = 'google' | 'github' | 'facebook';

export class SocialAuthDto {
  @IsEnum(['google', 'github', 'facebook'])
  provider: SocialProvider;

  @IsString()
  code: string;

  @IsString()
  redirectUri: string;

  @IsOptional()
  @IsString()
  codeVerifier?: string;
}
