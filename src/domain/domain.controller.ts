import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException } from '@nestjs/common';
import { DomainService } from './domain.service';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';


// Assume acct_id will be sourced from a session object, hence its should be supplied 
// by users on any of the requests
let sessionObj = { acct_id: 100 }


@Controller('/domains')
export class DomainController {
  constructor(private readonly domainService: DomainService) {}

  /* create domain */
  @Post()
  create(@Body() body: CreateDomainDto) {
    body.acct_id = sessionObj.acct_id;  /* attach acct_id to session object */
    return this.domainService.create(body);
  }

  /* find all domains within acct_id */
  @Get()
  findAll() {
    const { acct_id } = sessionObj;
    return this.domainService.findAllByAcctId(acct_id);
  }
  
  /* get domain by id */
  @Get('/:id')
  async findById(@Param('id') id: string) {
    const { acct_id } = sessionObj;
    const domain = await this.domainService.findById(acct_id, parseInt(id));
    if (!domain) {
      throw new NotFoundException('domain not found')
    }
    return domain;
  }

  /* get all domains for given acct_id */
  // @Get()
  // findAllByAcctId(@Query('acctid') acct_id: string) {  
  //   return this.domainService.findAllByAcctId(parseInt(acct_id));
  // }

  /* returns all domains for a given acct_id */
  // @Get()
  // findAll() {  
  //   console.log("INSIDE FIND ALL")
  //   const acct_id = sessionObj.acct_id;
  //   return this.domainService.findAllByAcctId(acct_id);
  // }

  /* looks up a domain by name */
  @Get('/name/:name')
  findByName(@Param('name') name: string) {  
    const { acct_id } = sessionObj;
    return this.domainService.findByName(acct_id, name);
  }

  /* update domain name or base_url  */
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateDomainDto) {
    body.acct_id = sessionObj.acct_id;
    return this.domainService.update(parseInt(id), body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const { acct_id } = sessionObj;
    return this.domainService.remove(acct_id, parseInt(id));
  }
}
