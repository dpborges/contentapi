import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { Domain } from  '../../domain/entities/domain.entity';

/**
 * The CopyContentDto contains optional fields that can be changed on the copy
 */
export class CopyContentmdDto {
  
  @IsNumber()
  acct_id: number;

  @IsString()
  creator_id: string;

  @IsOptional()
  @IsString()
  domain_name: string;
  
  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  base_url: string;

  @IsOptional()
  @IsString()
  excerpt: string;

  @IsOptional()
  @IsArray()
  images: string;
   
}
