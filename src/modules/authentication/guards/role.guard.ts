import { Role } from '../../../../generated/prisma';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Observable } from 'rxjs';
import RequestWithUser from '../requests/user.request';
import JwtAuthenticationGuard from './jwt.guard';

const RoleGuard = (role: Role): Type<CanActivate> => {
  class RoleGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      return user?.role === role;
    }
  }

  return mixin(RoleGuardMixin);
};

export default RoleGuard;
