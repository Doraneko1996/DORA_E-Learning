import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  id: number;
  userName: string;
  role: number;
  iat: number;
  exp: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: JwtPayload) {
    if (!payload?.id || !payload?.exp) {
      throw new UnauthorizedException('Token không hợp lệ');
    }

    return {
      id: payload.id,
      username: payload.userName,
      role: payload.role,
      exp: payload.exp,
    };
  }
}
