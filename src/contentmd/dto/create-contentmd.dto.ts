import { IsEmail, IsString, IsNumber, IsArray, IsDate, IsOptional } from 'class-validator';
import { Domain } from  '../../domain/entities/domain.entity';

export class CreateContentmdDto {

  @IsNumber()
  acct_id: number;

  @IsString()
  creator_id: string;

  @IsString()
  domain_name: string;

  @IsString()
  content_id: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional() 
  @IsString()
  base_url: string = '';

  @IsString()
  @IsOptional() 
  excerpt: string;

  // @IsArray()
  @IsString()
  @IsOptional()
  images: string;

  @IsString()
  content_type: string;

  @IsString()
  file_type: string;

  @IsNumber()
  word_cnt: number;

  @IsOptional() 
  @IsString()
  lang: string = 'en';
 
}
