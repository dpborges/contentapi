import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// To be able to pass in the current user as a parameter to the route 
// method handler we must create a Parameter Decorator. In general, keep
// in mind that whatever the Parameter Decorator returns, becomes the argument 
// to the method handler.
// To create a custom decorator in nestjs, we pass in a function to 
// createParamDecorator function that takes two arguments: data and ExecutionContext,
// as shown below.
// Nopte that the execution context can be Http, gRPC, or Websocket, depending on what 
// protocol you are using. Note that we can replace the ExcecutionContext name 
// with a name like Request, but that would make it http specific. So we'll leave
// the general ExecutionContext. 
// As noted before, whatever we return from this decorator, will become the argument 
// to the method or function we are decorating. So if we return a User entity 
// from this function, that will become the argument (or param) to the function/
// method you are decorating.
// Lastly, be sure to import this Decorator in your controller in order to use it 
// in one of your route handlers. 
// If there is parameter passed into the decorator itself, it will be passed down
// as data, to our function within the decorator.
export const CurrentUser = createParamDecorator(
  /* never below, tells typescript not to allow passing an arg to the decorator */
  (data: never, context: ExecutionContext) => {
    /* get the underlying request */
    const request = context.switchToHttp().getRequest();
    console.log(request.session.userId);
    return request.currentUser;  /* the current user property was added by our current-user intercept */
  }
)