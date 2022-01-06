import { Expose } from 'class-transformer';

// Notice that since we do not want to send back password,
// we are not including it in the Dto. Essentially, what we are doing here
// is only listing what we want to expose
export class UserDto {

  @Expose()
  id: number;

  @Expose()
  email: string;

}