import { IsEmail, IsString, IsOptional, IsNumber  } from 'class-validator';

export class UpdateDomainDto {

  @IsString()
  @IsOptional()
  acct_id: number;

  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  base_url: string;

}
