import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { UsersService } from '../users.service';
import { User } from '../user.entity';

// Tells typescript that the Express Request object may have a user property
// that is an instance of a User type. This allows us to tack on the currentUser 
// property to the Express Request object.
declare global {
  namespace Express {
    interface Request {
      currentUser?: User;
    }
  }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  constructor(
    private usersService: UsersService
  ) {}

  /* we are required to call next() when our middleware is done executing */ 
  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session || {};

    // the statment req.currentUser = user; below is trying to assign a value to
    // a property that does not exist on the request object. This is why we added it
    // to the Express/Request interace on top of this file.
    if (userId) {
      const user = await this.usersService.findOne(userId);
      req.currentUser = user;
    }

    next(); // we done; run whatever other middleware may exist
  }

}