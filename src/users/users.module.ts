import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';   // step 2 for create entity
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service'; 
import { User } from './user.entity'; // step 2 for create entity
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
// import { APP_INTERCEPTOR } from '@nestjs/core';
// import { CurrentUserInterceptor } from './interceptors/current-user.interceptor';
// CurrentUserInterceptor above and APP_INTERCEPTOR replaced by CurrentUserMiddleware

// Add class to list of providers that you want to take part in dependency injection(DI).
// These classes would be registered in our DI container. When ever we want to instantiate
// one of these classes, the DI container will instantiate class for us and it will 
// instantiate any dependencies of that class as well.
@Module({
  imports: [TypeOrmModule.forFeature([User])], // step 2 for create entity
  controllers: [UsersController],
  providers: [
    UsersService, 
    AuthService, 
    // {
    //   provide: APP_INTERCEPTOR,
    //   useClass: CurrentUserInterceptor  // replaced with currentUser middleware
    // }
  ]
})
export class UsersModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*'); // asterisk indicates all routes
  }
}
