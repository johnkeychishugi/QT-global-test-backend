import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateUrlDto {
  @IsUrl()
  readonly longUrl!: string;

  @IsString()
  @IsOptional()
  readonly customCode?: string;
} 