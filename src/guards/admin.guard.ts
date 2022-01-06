import { CanActivate, ExecutionContext } from "@nestjs/common";

export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    /* pull out the request */
    const request = context.switchToHttp().getRequest();
    /* currentUser is added to request by currentUser interceptor */ 
    if (!request.currentUser) {
      return false;
    }

    return request.currentUser.admin; // returns boolean property in database for this user
  }
}

