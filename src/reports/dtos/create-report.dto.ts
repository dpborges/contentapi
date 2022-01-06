import {
  IsString,
  IsNumber,
  Min, Max,
  IsLongitude,
  IsLatitude
} from 'class-validator';

// Because we have set up a Global Valildation Pipe, nest will apply this body of
// DTO validations to the incoming requests.
export class CreateReportDto {

  @IsString()
  make: string;

  @IsString()
  model: string;

  @IsNumber()
  @Min(1930)
  @Max(2050)
  year: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  mileage: number;

  @IsLongitude()
  lng: number;

  @IsLatitude()
  lat: number;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  price: number;

}