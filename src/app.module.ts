import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ReportsModule } from './reports/reports.module';
import { User } from './users/user.entity';  // step 3 for create entity
import { Report } from './reports/report.entity';  // step 3 for create entity
import { DomainModule } from './domain/domain.module';


// following format required because nestjs tsconfig settings
const cookieSession = require('cookie-session');

// forRoot indicates that connect will be shared with all downstream modules
// Note that forRoot takes an options object defining our db type.
// Also note that we moved the ValiationPipe from the main.ts file to the
// providers list in this file, so we can run our E2E tests
@Module({
  imports: [UsersModule, ReportsModule, 
    ConfigModule.forRoot({
      isGlobal: true,      // allows us to use ConfigModule globally across application
      envFilePath: `.env.${process.env.NODE_ENV}` // reads appropriate .env file based on NODE_ENV
    }),   
    // -- Below used when using ormconfig.js as the config source
    TypeOrmModule.forRoot(), DomainModule  // reads config from ormconfig.js or env variables
    // -- Below used for nestjs specific config only
    // TypeOrmModule.forRootAsync({   
    //     inject: [ConfigService],
    //     useFactory: (config: ConfigService) => {
    //       return {
    //         type: 'sqlite',
    //         database: config.get<string>('DB_NAME'),  // pull variable we want to pull from .env file
    //         synchronize: true,
    //         entities: [User, Report],       // step 3 for create entity; add entity to array
    //       };
    //     },
    // })            
    // TypeOrmModule.forRoot({        // Setup w/out ConfigService
    //   type: 'sqlite',
    //   database: 'db.sqlite',
    //   entities: [User, Report],    // step 3 for create entity; add entity to array
    //   synchronize: true
    // })
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,   // run every request that comes in through this global pipe
      useValue: new ValidationPipe({
        whitelist: true   // when true strips any additional properties not in your dto from getting to backend
      })                   // note; it does not throw an error. It on strips out extraneos properties
    }
  ]
})

// The configure function will be called automatically whenever our application starts
// to listen to incoming traffic. The function is used set up whatever middleware you
// want to run. Below we set up cookSession middleware for all our routes.
export class AppModule {

  constructor(
    private configService: ConfigService 
  ) {}

  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      cookieSession({
        keys: [this.configService.get('COOKIE_KEY')], // The string in the keys array is used to encrypt the session object
     }),
    ).forRoutes('*');
  }
}
