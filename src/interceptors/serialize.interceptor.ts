import { UseInterceptors, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { plainToClass } from 'class-transformer';
const loginfo = console.log;

// This is a class interface. This allows to enforce a type of 'class' (instead of any),
// as is the case with the Serialize argument below.
interface ClassConstructor {
  new (...args: any[]): {}
}

// Below we are creating our own CUSTOM DECORATOR using the SerializerInterceptor
// class below. This allows us to shorten the code we would otherwise have to 
// use in the controller. The ClassConstructor type is defined above.
export function Serialize(dto: ClassConstructor) {
  return UseInterceptors(new SerializerInterceptor(dto))
}

// Note that this same class can be use for intercepting both inbound requests and 
// outbound responses. When we instantiate, we pass in the Dto (eg. UserDto) we 
// want to serialize
export class SerializerInterceptor implements NestInterceptor {

  constructor(private dto: any) {};  //allows us to call new with dto of our choice

  intercept(context: ExecutionContext, handler: CallHandler) : Observable<any> {
    // INBOUND: Put code here you want to run before request is handled by request handler
    loginfo('Im running before the handler', context); // use for debugging

    
    return handler.handle().pipe(
      map((data: any) => {
      // OUTBOUND: Put code here you want to run before response is sent out. 
      // Note, data is the data we are sending back in the outgoing response
      loginfo('Im running before reponse is sent out', data); // use for debugging
      /* transform instance of the data javascript object to instance of the UserDto class */
      /* the excludeExtraneousValues: true, will redact any property w/out Expose decorator */
      return plainToClass(this.dto, data, {
        excludeExtraneousValues: true
      })
      }),
    );
  }
}
