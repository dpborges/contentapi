import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ContentmdService } from './contentmd.service';
import { CreateContentmdDto } from './dto/create-contentmd.dto';
import { UpdateContentmdDto } from './dto/update-contentmd.dto';

@Controller('contentmd')
export class ContentmdController {
  constructor(private readonly contentmdService: ContentmdService) {}

  @Post()
  create(@Body() createContentmdDto: CreateContentmdDto) {
    return this.contentmdService.create(createContentmdDto);
  }

  @Get()
  findAll() {
    return this.contentmdService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contentmdService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentmdDto: UpdateContentmdDto) {
    return this.contentmdService.update(+id, updateContentmdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentmdService.remove(+id);
  }
}
