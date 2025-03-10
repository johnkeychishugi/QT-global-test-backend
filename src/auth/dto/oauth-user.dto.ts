import { IsString, IsEmail, IsOptional } from 'class-validator';

export class OAuthUserDto {
  @IsString()
  readonly provider!: string;

  @IsString()
  readonly providerId!: string;

  @IsEmail()
  readonly email!: string;

  @IsString()
  readonly name!: string;

  @IsString()
  @IsOptional()
  readonly picture?: string;
} 