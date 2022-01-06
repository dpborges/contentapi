import { Body, Controller, Post, Get, Patch, Param, Query, Delete,
  NotFoundException, ClassSerializerInterceptor,
 Session, UseGuards  } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { Serialize } from '../interceptors/serialize.interceptor';
// import { SerializerInterceptor } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user-dto'; // dto used to redact password from findUser() response
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
// import { CurrentUserInterceptor } from './interceptors/current-user.interceptor'; /* used for controller scoped interceptor  */
import { User } from './user.entity';
import { AuthGuard } from '../guards/auth.guard';

@Controller('auth') //serves as url prefix
@Serialize(UserDto) // Note: this is a CUSTOM DECORATOR which exported from serialize.interceptor file
// @UseInterceptors(CurrentUserInterceptor) /* used for controller scoped interceptor  */
export class UsersController {

  constructor(
    private usersService: UsersService,
    private authService:  AuthService
  ) {};

  // @Get('/whoami')
  // whoAmI(@Session() session: any) {
  //   return this.usersService.findOne(session.userId);
  // }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }


  // The creatUser takes in the incoming body that s/d be of type CreateUserDto
  // and it takes in the Cookie-Session object
  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {  
    const user = await this.authService.signup(body.email, body.password); 
    session.userId = user.id; /* assign user id to session object */
    return user;
  }

  // The creatUser takes in the incoming body that s/d be of type CreateUserDto
  // and it takes in the Cookie-Session object
  @Post('/signin')
  async signin(@Body() body: CreateUserDto, @Session() session: any) { 
    const user = await this.authService.signin(body.email, body.password); 
    session.userId = user.id; /* assign user id to session object */
    return user;
  }

  @Post('/signout')
  signOut(@Session() session: any) {
    session.userId = null;
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) {  // note that numbers (eg id) on url are parsed as string
    console.log('Inside route handler');
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found')
    }
    return user;
  }

  @Get()
  findAllUsers(@Query('email') email: string) {  
    return this.usersService.find(email);
  }

  @Delete('/:id') 
  removeUser(@Param('id') id: string) {  // note that numbers (eg id) on url are parsed as string
    return this.usersService.remove(parseInt(id));
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body)
  }

}
