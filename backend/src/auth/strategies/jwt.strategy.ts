import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../auth.service';

export type RequestCashier = {
  cashierId: string;
  email: string;
  hospitalId: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): RequestCashier {
    if (!payload?.sub || !payload.hospitalId) {
      throw new UnauthorizedException();
    }
    return {
      cashierId: payload.sub,
      email: payload.email,
      hospitalId: payload.hospitalId,
    };
  }
}
