import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ActualUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    user.hashPassword = undefined;
    user.currentHashedRefreshToken = undefined;
    return user;
  },
);
