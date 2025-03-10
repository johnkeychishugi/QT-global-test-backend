import { Controller, Post, Body, UseGuards, Get, Res, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshGuard } from './guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Response } from 'express';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiCookieAuth
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
    description: 'User successfully registered',
    schema: {
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid input' })
  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.register(registerDto);
    
    // Set refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    
    return { accessToken: tokens.accessToken };
  }

  @ApiOperation({ summary: 'Log in with email/username and password' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'User successfully logged in',
    schema: {
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid credentials' })
  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const tokens = await this.authService.login(loginDto);
    
    // Set refresh token as HttpOnly cookie
    this.setRefreshTokenCookie(response, tokens.refreshToken);
    
    return { accessToken: tokens.accessToken };
  }

  @ApiOperation({ summary: 'Log out the current user' })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged out' })
  @ApiBearerAuth('access-token')
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    // Clear the refresh token cookie
    response.clearCookie('refresh_token');
    return { message: 'Logged out successfully' };
  }

  @ApiOperation({ summary: 'Refresh the access token using refresh token' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Tokens successfully refreshed',
    schema: {
      properties: {
        accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
      }
    }
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Invalid refresh token' })
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