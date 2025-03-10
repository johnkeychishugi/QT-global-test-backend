import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../users/user.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GithubStrategy } from './strategies/github.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    JwtModule.register({}),
    ConfigModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService, 
    JwtStrategy, 
    JwtRefreshStrategy,
    GoogleStrategy,
    GithubStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {} 