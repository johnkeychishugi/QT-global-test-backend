import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @MinLength(3)
  readonly username!: string;

  @IsString()
  @MinLength(6)
  readonly password!: string;

  @IsString()
  @IsOptional()
  readonly name?: string;
} 