import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OAuthUserDto } from './dto/oauth-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ accessToken: string; refreshToken: string }> {
    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({ 
      where: [
        { email: registerDto.email },
        { username: registerDto.username }
      ]
    });
    
    if (existingUser) {
      throw new BadRequestException('User with this email or username already exists');
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(registerDto.password, 12);

    // Create and save the new user
    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      name: registerDto.name,
      passwordHash,
    });
    
    await this.usersRepository.save(user);

    // Generate tokens
    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findOne({
      where: [
        { email: loginDto.emailOrUsername },
        { username: loginDto.emailOrUsername }
      ]
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    if (!loginDto.password) {
      throw new UnauthorizedException('Password is required');
    }

    // @ts-ignore - We've already checked that password exists
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    return this.generateTokens(user);
  }

  private generateTokens(user: User): { accessToken: string; refreshToken: string } {
    const payload = { sub: user.id, username: user.username };
    
    const accessToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: '15m',
    });
    
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  async refreshTokens(userId: string, refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }
    
    try {
      this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
    
    return this.generateTokens(user);
  }

  async validateOAuthUser(oauthUserDto: OAuthUserDto): Promise<User> {
    // Try to find existing user by provider and providerId
    let user = await this.usersRepository.findOne({ 
      where: { 
        provider: oauthUserDto.provider,
        providerId: oauthUserDto.providerId
      } 
    });

    // If user doesn't exist, try to find by email
    if (!user) {
      const existingUser = await this.usersRepository.findOne({ 
        where: { email: oauthUserDto.email } 
      });

      if (existingUser) {
        // If user exists with email but not linked to OAuth, update with OAuth info
        existingUser.provider = oauthUserDto.provider;
        existingUser.providerId = oauthUserDto.providerId;
        existingUser.picture = oauthUserDto.picture;
        
        // Save the updated user
        user = await this.usersRepository.save(existingUser);
      } else {
        // Create a new user
        const username = await this.generateUniqueUsername(oauthUserDto.name);
        const newUser = this.usersRepository.create({
          email: oauthUserDto.email,
          username,
          name: oauthUserDto.name,
          picture: oauthUserDto.picture,
          provider: oauthUserDto.provider,
          providerId: oauthUserDto.providerId,
        });
        
        user = await this.usersRepository.save(newUser);
      }
    }

    return user;
  }

  private async generateUniqueUsername(name: string): Promise<string> {
    // Remove spaces and special characters
    let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // If the name is too short, add a default
    if (baseUsername.length < 3) {
      baseUsername = 'user';
    }
    
    let username = baseUsername;
    let count = 1;
    
    // Check if username exists, if so, add a number and try again
    while (await this.usersRepository.findOne({ where: { username } })) {
      username = `${baseUsername}${count}`;
      count++;
    }
    
    return username;
  }

  async oauthLogin(user: User): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const tokens = this.generateTokens(user);
    return { ...tokens, user };
  }
} 