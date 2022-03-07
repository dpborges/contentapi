import { PartialType } from '@nestjs/mapped-types';
import { CreateContentmdDto } from './create-contentmd.dto';
import { IsEmail, IsString, IsOptional, IsNumber, IsArray  } from 'class-validator';

export class UpdateContentmdDto extends PartialType(CreateContentmdDto) {

  @IsOptional()
  @IsNumber()
  domain_id: number;

  @IsOptional()
  @IsString()
  content_id: string;

  @IsOptional()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  base_url_override: string;

  @IsOptional()
  @IsString()
  excerpt: string;

  @IsOptional()
  @IsArray()
  images: string;

  @IsOptional()
  @IsString()
  content_type: string;

  @IsOptional()
  @IsString()
  file_type: string;

  @IsOptional()
  @IsNumber()
  word_cnt: number;

  @IsOptional()
  @IsString()
  lang: string;

}
