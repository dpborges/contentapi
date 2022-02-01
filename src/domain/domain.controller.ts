import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException } from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';

@Controller('/domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  /* create domain */
  @Post()
  create(@Body() body: CreateDomainDto) {
    return this.domainService.create(body);
  }

  /* NOT IN USE */
  // @Get()
  // findAll() {
  //   return this.domainService.findAll();
  // }
  
  /* get domain by id */
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    const domain = await this.domainService.findOne(parseInt(id));
    if (!domain) {
      throw new NotFoundException('domain not found')
    }
    return domain;
  }

  /* get all domains for given acct_id */
  @Get()
  findAllByAcctId(@Query('acctid') acct_id: string) {  
    return this.domainService.findAllByAcctId(parseInt(acct_id));
  }

  /* update domain name or base_url  */
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateDomainDto) {
    return this.domainService.update(parseInt(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.domainService.remove(parseInt(id));
  }
}
