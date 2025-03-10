import { IsString, IsEmail, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail()
  @IsString()
  readonly email!: string;

  @ApiProperty({
    description: 'Username for login',
    example: 'john_doe',
    minLength: 3
  })
  @IsString()
  @MinLength(3)
  readonly username!: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongP@ssw0rd',
    minLength: 8,
    format: 'password'
  })
  @IsString()
  @MinLength(8)
  readonly password!: string;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
    required: false
  })
  @IsString()
  readonly name?: string;
} 