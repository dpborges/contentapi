import { CopyContentmdDto } from './dto/copy-contentmd.dto';
import { 
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  NotFoundException
} from '@nestjs/common';
import { ContentmdService } from './contentmd.service';
import { CreateContentmdDto } from './dto/create-contentmd.dto';
import { UpdateContentmdDto } from './dto/update-contentmd.dto';
import { Domain } from '../domain/entities/domain.entity'

// Assume acct_id will be sourced from a session object, hence its should be supplied 
// by users on any of the requests
const sessionObj = { acct_id: 1 }


@Controller()
export class ContentmdController {
  constructor(private readonly contentmdService: ContentmdService) {}

  // @Post()
  // create(@Body() body: CreateContentmdDto) {
  //   return this.contentmdService.create(body);
  // }

  // @Post(':id/copy')
  // copy(@Param('id') id: number, @Body() copyContentmdDto: CopyContentmdDto) {
  //   return this.contentmdService.copy(id, copyContentmdDto)
  // }

  // ***** LEAVE THIS BLOCK COMMENTED **********
  // @Post()
  // copy(@Body() body: CreateContentmdDto) {
  //   return this.contentmdService.create(body);
  // }
  // ***** LEAVE THIS BLOCK COMMENTED **********

  @Get('contentmd')
  findAll() {
    let acct_id: number = sessionObj.acct_id;
    let domain_name: string = "default";
    return this.contentmdService.findAll(acct_id, domain_name);
  }
  
  // @Get()
  // findAllByAcctAndDomainId(
  //      @Query('acct_id') acct_id: string,
  //      @Query('domain_id') domain_id: string,
  //   ) {  
  //   // return { acct_id: parseInt(acct_id), domain_id: parseInt(domain_id) }
  //   return this.contentmdService.findAllByAcctAndDomainId(parseInt(acct_id), parseInt(domain_id));
  // }

  // @Get('domain/:id/slug/:slug')
  // findBySlug(
  //     @Param() params
  //     //  @Query('acct_id') acct_id: string,
  //     //  @Query('domain_id') domain_id: string,
  //     //  @Query('slug') slug: string,
  //   ) {  
  //   // return { acct_id: parseInt(acct_id), domain_id: parseInt(domain_id), slug }
  //   return {  domain_id: params.id, slug: params.slug }
  //   // return this.contentmdService.findByAcctDomainIdAndSlug(parseInt(acct_id), parseInt(domain_id), slug);
  // }

  // @Get(':id')
  // async findOne(@Param('id') id: string) {
  //   const contentmd = await this.contentmdService.findOne(parseInt(id));
  //   if (!contentmd) {
  //     throw new NotFoundException(`content meta data not found for id: ${id}`)
  //   }
  //   return contentmd;
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateContentmdDto: UpdateContentmdDto) {
  //   return this.contentmdService.update(parseInt(id), updateContentmdDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.contentmdService.remove(parseInt(id));
  // }

  

}
