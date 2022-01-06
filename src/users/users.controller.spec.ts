import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;  /* declare class type UsersService */
  let fakeAuthService: Partial<AuthService>;    /* declare class type AuthService */

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({id, email: 'user1@foo.com', password: 'somepassword' } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{id: 1, email, password: 'somepassword'} as User]);
      },
      // remove: () => {},
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService, 
          useValue: fakeUsersService
        },
        {
          provide: AuthService, 
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns a list fo users with the give email', async () => {
    const users = await controller.findAllUsers('user1@foo.com');
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('user1@foo.com');
  });
  
  it('findUser returns a single user with the given id', async () => {
    const users = await controller.findUser('1');
    expect(users).toBeDefined();
  });

  it('findUser trhows an exception if user with given id is not found', async () => {
    expect.assertions(1);
    fakeUsersService.findOne = () => null;
    try {
      await controller.findUser('1');
    } catch(e) {
      expect(e).toEqual(new NotFoundException('user not found'))
    }
  });

  it('signin updates session object and returns user', async () => {
    const session = {userId: -1};
    const user = await controller.signin(
      {email: 'user1@foo.com', password: 'somepassword'},
      session
    );
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);

  })


});
