import { IsEmail, IsString, IsOptional, IsNumber  } from 'class-validator';

export class CreatePromotionDto {
  
  @IsNumber()
  acct_id: number;

  @IsNumber()
  domain_id: number;

  @IsNumber()
  contentmd_id: number;

  @IsNumber()
  parent_contentmd_id: number;

  @IsNumber()
  parent_id: number;  /* self referencing id */

}

