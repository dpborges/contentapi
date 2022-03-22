import { IsEmail, IsString, IsOptional, IsNumber  } from 'class-validator';

export class CreateDomainDto {

  @IsString()
  name: string;

  @IsString()
  base_url: string;

  @IsOptional()
  @IsNumber()
  acct_id: number;

}
