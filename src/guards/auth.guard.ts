import {
  CanActivate,
  ExecutionContext
} from '@nestjs/common'
import { Observable } from 'rxjs'

// AuthGuard makes sure someone is signed into the application before they get routed to the route handler
// CanActive is standard interface that defines a guard.
// The reason we use the name ExecutionContext instead of Request, is becuase
// in theory this can be used with different communication protocols (eg. http, gRPC, websockets)
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    /* pull out the request */
    const request = context.switchToHttp().getRequest();
    /* if user is undefined or null we'll return a falsy value which will 
       reject the request. If user exists (truthy value), request will be processed */
    return request.session.userId;
  }
}