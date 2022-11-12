import { createParamDecorator, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export const CurrentUser = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    return context.switchToHttp().getRequest().user;
  },
);

@Injectable()
export class BearerAuthGuard extends AuthGuard('bearer') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (user instanceof Error) throw user;
    return super.handleRequest(err, user, info, context, status);
  }
}

export class WeakBearerAuthGuard extends BearerAuthGuard {
  // https://stackoverflow.com/questions/63257879/get-current-user-in-nestjs-on-a-route-without-an-authguard
  handleRequest(err: any, user: any) {
    if (user instanceof Error) throw user;
    if (user) return user;
    return null;
  }
}