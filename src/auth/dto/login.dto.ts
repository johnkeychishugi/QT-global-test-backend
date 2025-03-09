import { IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  readonly emailOrUsername!: string;

  @IsString()
  readonly password!: string;
} 