import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { doesNotMatch } from 'assert';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the UsersService. The fakeUsersService has a default
    // behavior for find and create. If you look at signup test, we can override behavior of ind
    // to suit the test.
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter(user => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {id: Math.floor(Math.random() * 999999), email, password, } as User;
        users.push(user);
        return Promise.resolve(user);
      }
    }

    /* create a DI container providing a configuration object */
    const module = await Test.createTestingModule({
      providers: [
        AuthService,                 /* when I ask for AuthService, give me instance of AuthService */
        {
          provide: UsersService,     /* when I ask for UsersService, give me instance of fakeUsersService */
          useValue: fakeUsersService
        }
      ]
    }).compile();
    /* get a copy of the auth service by intializing service with all its dependencies */
    service = module.get(AuthService);
  })

  it('can create an instance of the auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates new user with salted and hashed password', async () => {
    const user  = await service.signup('asdf@asdf.com', 'asdfuser');
    /* make sure password is not same as input and has hash-salted pattern */
    expect(user.password).not.toEqual('asdfuser');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws error if user signs up with email that is in use', async () => {
    /* Test by trying to signup 2x's with same email / password */
    expect.assertions(1);
    /* sign up with user/password 1st time */
    await service.signup('foouser@foo.com', 'foopw');
    try {
      /* try signing up again with same user/password a 2nd time */
      await service.signup('foouser@foo.com', 'foopw');
    } catch(e) {
      expect(e).toEqual(new BadRequestException('email in use'))
    }
  });

  it('throws error if signin is called with unused email', async () => {
    try {
      await service.signin('a@a.com', 'xyz');
    } catch(e) {
      expect(e).toEqual(new NotFoundException('user not found'))
    }
  })

  it('throws exception if an invalid password is provided', async () => {
    /* test by signing up with one password and signing in with another */
    expect.assertions(1);
    await service.signup('usermail2@gg.com', 'pass123')
    try {
      await service.signin('usermail2@gg.com', 'passxyz');
    } catch(e) {
      expect(e).toEqual(new BadRequestException('invalid password'))
    }
  })

  it('returns user if correct password is provided', async () => {
    /* sign up as user */
    await service.signup('alksfas@jj.com', 'asasfpw');

    /* sign in as user I just signed up as */
    const user = await  service.signin('alksfas@jj.com', 'asasfpw');
    expect(user).toBeDefined();
    //  CODE BELOW IS USED TO GENERATE SALTED AND HASHED PASSWORD TO TEST WITH 
    //  const user = await service.signup('asfijas@gg.com', 'asasfpw');
    //  console.log(user)

  });

})

