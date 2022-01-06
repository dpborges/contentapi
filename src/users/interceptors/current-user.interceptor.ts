// Note that since this interceptor was specify to currentUser,
// we created under the users folder, as opposed to the serialize interceptor
// which as more global in nature.

import { 
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable
} from '@nestjs/common';
import { Observable } from 'rxjs';

import { UsersService } from '../users.service';

// IMPORTANT: THIS INTERCEPTOR IS NO LONGER CALLED AS IT WAS REPLACED
// BY THE CurrentUserMiddleware, BECAUSE CURRENT USER HAD TO BE ADDED
// TO REQUEST OBJECT BEFORE THE AUTH GUARD. HENCE IT HAD TO BE IMPLEMENTED
// AS MIDDLEWARE WHICH RUN BEFORE GUARDS.

@Injectable()  /* this allows us to make use of dependency injection */
export class CurrentUserInterceptor implements NestInterceptor {
  constructor(private usersService: UsersService) {}

  /* Note the handler below, is essentially the route handler */
  async intercept(context: ExecutionContext, handler: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const { userId } = request.session || {};

    if (userId) {
      const user = await this.usersService.findOne(userId);
      request.currentUser = user; /* assign user to request object so its available down stream in the route handlers param decorator */
    }

    return handler.handle(); /* essential ends up running the route handler */
  }

}