import { IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateProjectDto {

  @IsOptional()
  @IsString()
  acct_id: number;

  @IsString()
  name: string;

}



