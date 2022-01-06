import { Injectable, BadRequestException, NotFoundException } from "@nestjs/common";
import { UsersService } from './users.service';
import { randomBytes, scrypt as _scrypt } from "crypto";
import { promisify } from "util";

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async signup(email: string, password: string) {
    // See if email already exists
    const users = await this.usersService.find(email);
    if (users.length) {  // if length 0, throw exception
      throw new BadRequestException('email in use')
    }
    // Generate Salt of 8 bytes of data; where 1 byte converts to 2 hex characters
    // therefore, we'll have 16 characters
    const salt = randomBytes(8).toString('hex');

    // Hash the salt and the password together; size of hash in characters
    // Without Buffer, typescript does not know what hash is. In this case 
    // we are telling typescript Buffer is a class representing a raw memory allocation
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    
    // Join our Salt and the hash result
    const result = salt + '.' + hash.toString('hex');

    // Create new user with the salted and hashed password.
    const user = await this.usersService.create(email, result);

    return user;
  }

  async signin(email: string, password: string) {
    // Look up user by email
    const [user] = await this.usersService.find(email);
    if (!user) {
      throw new NotFoundException('user not found')
    }

    // Get and split the salt the hash
    const [salt, storedHash] = user.password.split('.');

    // Hash the input password
    const hash = (await scrypt(password, salt, 32)) as Buffer;

   // See if hash matches
   if (storedHash !== hash.toString('hex')) {
    throw new BadRequestException('invalid password')
   }

   return user;

  }
  
}