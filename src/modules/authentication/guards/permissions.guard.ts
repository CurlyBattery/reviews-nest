import { Permission, Role } from '../../../../generated/prisma';
import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import RequestWithUser from '../requests/user.request';
import JwtAuthenticationGuard from './jwt.guard';

const PermissionGuard = (permission: Permission): Type<CanActivate> => {
  class PermissionGuardMixin extends JwtAuthenticationGuard {
    async canActivate(context: ExecutionContext) {
      await super.canActivate(context);

      const request = context.switchToHttp().getRequest<RequestWithUser>();
      const user = request.user;

      return user?.role === Role.Admin
        ? true
        : request.params.id
          ? Number(request.params.id) === user.id &&
            user?.permissions.includes(permission)
          : false;
    }
  }

  return mixin(PermissionGuardMixin);
};

export default PermissionGuard;
