import { PartialType } from '@nestjs/mapped-types';
import { CreateContentmdDto } from './create-contentmd.dto';

export class UpdateContentmdDto extends PartialType(CreateContentmdDto) {}
