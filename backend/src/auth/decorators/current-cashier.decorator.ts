import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestCashier } from '../strategies/jwt.strategy';

export const CurrentCashier = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): RequestCashier => {
    const req = ctx.switchToHttp().getRequest<{ user: RequestCashier }>();
    return req.user;
  },
);
