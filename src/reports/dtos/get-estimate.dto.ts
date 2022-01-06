import {
  IsString,
  IsNumber,
  Min, Max,
  IsLongitude,
  IsLatitude
} from 'class-validator';
import { Transform } from 'class-transformer';

// Because we have set up a Global Valildation Pipe, nest will apply this body of
// DTO validations to the incoming requests.
export class GetEstimateDto {

  @IsString()
  make: string;

  @IsString()
  model: string;

  /* note that value is the incoming value, in this case, its the year  */
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1930)
  @Max(2050)
  year: number;

  /* note that value is the incoming value, in this case, its the year  */
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  /* note that value is the incoming value, in this case, its the year  */
  @Transform(({ value }) => parseFloat(value)) // use parseFloat for decimals
  @IsLongitude()
  lng: number;

  /* note that value is the incoming value, in this case, its the year  */
  @Transform(({ value }) => parseFloat(value)) // use parseFloat for decimals
  @IsLatitude()
  lat: number;
 
}