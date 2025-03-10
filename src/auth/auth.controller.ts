import { Controller, Post, Body, UseGuards, Get, Res, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.register(registerDto);
    
    // Set refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(loginDto);
    
    // Set refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear the refresh token cookie
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request & { user: { sub: string }, cookies: { refresh_token: string } }, @Res({ passthrough: true }) response: Response) {
    const userId = req.user.sub;
    const refreshToken = req.cookies.refresh_token;
    
    const tokens = await this.authService.refreshTokens(userId, refreshToken);
    
    // Set new refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    
    return { accessToken: tokens.accessToken };
  }

  private setRefreshTokenCookie(response: Response, token: string) {
    response.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/auth/refresh',
    });
  }

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // This route initiates the Google OAuth flow
    // The actual redirection is handled by Passport
    console.log('Google OAuth flow initiated');
  }

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    const user = req.user;
    const tokens = await this.authService.oauthLogin(user);
    
    // Set refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    
    // Redirect to frontend with access token
    response.redirect(`${process.env.FRONTEND_URL}/auth/social-callback?token=${tokens.accessToken}`);
  }

  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  githubAuth() {
    // This route initiates the GitHub OAuth flow
    // The actual redirection is handled by Passport
    console.log('GitHub OAuth flow initiated');
  }

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(@Req() req: any, @Res({ passthrough: true }) response: Response) {
    const user = req.user;
    const tokens = await this.authService.oauthLogin(user);
    
    // Set refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    
    // Redirect to frontend with access token
    response.redirect(`${process.env.FRONTEND_URL}/auth/social-callback?token=${tokens.accessToken}`);
  }
} 