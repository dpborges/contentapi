import { Expose, Transform } from 'class-transformer';
import { User } from '../../users/user.entity';

// This Dto is used to serialize response
// @Expose, exposes those columns to the response output
export class ReportDto {
  @Expose()
  id: number;

  @Expose()
  price: number;

  @Expose()
  year: number;

  @Expose()
  lng: number;

  @Expose()
  lat: number;

  @Expose()
  make: string;

  @Expose()
  model: string;

  @Expose()
  mileage: number;

  @Expose()
  approved: boolean;

  // the transform pulls of the id property from the obj (aka report) .user object
  @Transform(({ obj }) => obj.user.id)
  @Expose()
  userId: number;

}