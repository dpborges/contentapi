import { PartialType } from '@nestjs/mapped-types';
import { CreateContentmdDto } from './create-contentmd.dto';
import { IsEmail, IsString, IsOptional, IsNumber, IsArray  } from 'class-validator';

export class UpdateContentmdDto extends PartialType(CreateContentmdDto) {

  @IsNumber()
  domain_id: number;

  @IsString()
  content_id: string;

  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  base_url_override: string;

  @IsString()
  excerpt: string;

  @IsArray()
  images: string;

  @IsString()
  content_type: string;

  @IsString()
  file_type: string;

  @IsNumber()
  word_cnt: number;

  @IsOptional()
  @IsString()
  lang: string;

}
