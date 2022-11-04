import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { AuthUser } from './auth-user.entity';
import { AuthService } from './auth.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService
  ) {
    super();
  }

  async validate(tokenId: string): Promise<AuthUser|UnauthorizedException> {
    const token = await this.authService.check(tokenId);
    if (!token) return new UnauthorizedException('Wrong token');
    const user = token.user;
    return Object.assign(new AuthUser, user, { token });
  }
}