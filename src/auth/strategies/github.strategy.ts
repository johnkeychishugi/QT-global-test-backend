import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GITHUB_CALLBACK_URL')!,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: Function,
  ): Promise<any> {
    const { id, displayName, username, photos, emails } = profile;
    
    // GitHub might not expose email addresses directly in the profile
    const email = emails && emails.length > 0 ? emails[0].value : `${username}@github.com`;

    const user = await this.authService.validateOAuthUser({
      provider: 'github',
      providerId: id,
      email: email,
      name: displayName || username,
      picture: photos && photos.length > 0 ? photos[0].value : null,
    });

    done(null, user);
  }
} 