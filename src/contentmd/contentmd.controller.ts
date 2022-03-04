import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  NotFoundException
} from '@nestjs/common';
import { ContentmdService } from './contentmd.service';
import { CreateContentmdDto } from './dto/create-contentmd.dto';
import { UpdateContentmdDto } from './dto/update-contentmd.dto';
import { Domain } from '../domain/entities/domain.entity'

@Controller('contentmd')
export class ContentmdController {
  constructor(private readonly contentmdService: ContentmdService) {}

  @Post()
  create(@Body() body: CreateContentmdDto) {
    return this.contentmdService.create(body);
  }

  // @Get()
  // findAll() {
  //   return this.contentmdService.findAll();
  // }
  
  @Get()
  findAllByDomainId(@Query('domain_id') domain_id: string) {  
    return this.contentmdService.findAllByDomainId(parseInt(domain_id));
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const contentmd = await this.contentmdService.findOne(parseInt(id));
    if (!contentmd) {
      throw new NotFoundException(`content meta data not found for id: ${id}`)
    }
    return contentmd;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContentmdDto: UpdateContentmdDto) {
    return this.contentmdService.update(parseInt(id), updateContentmdDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.contentmdService.remove(parseInt(id));
  }
}
