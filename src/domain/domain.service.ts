import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { Domain } from './entities/domain.entity';

@Injectable()
export class DomainService {

  constructor(@InjectRepository(Domain) private domainRepo: Repository<Domain>) {}

  async create(createDomainDto: CreateDomainDto) {
    const domainExist = await this.domainExist(createDomainDto.acct_id, createDomainDto.name);
    if (domainExist) {
      throw new ConflictException(`Domain name '${createDomainDto.name}' already exists `)
    } 
    /* create instance of Domain */
    const newDomain = this.domainRepo.create(createDomainDto);
    /* save to repository */
    return this.domainRepo.save(newDomain);
  }

  findAllByAcctId(acct_id) {
    return getRepository(Domain)
      .createQueryBuilder("domain")     
      .where("domain.acct_id = :acct_id", { acct_id })
      .getMany();
  }

  /* NOT IN USE */
  // findAll() {
  //   return this.domainRepo.find();
  // }

  findOne(id: number) {
    if (!id) {   // needed for sqlite, otherwise findOne below will still return first found
      return null;
    }
    return this.domainRepo.findOne(id)
    
  }

  async update(id: number, updateDomainDto: UpdateDomainDto) {
    /* retrieve instance of domain */
    let domain = await this.domainRepo.findOne(id);
    if (!domain) {
      throw new NotFoundException(`Domain does not exist`)
    }
    /* update  domain */
    domain = Object.assign(domain, updateDomainDto)
    return this.domainRepo.save(domain);
  }

  async remove(id: number) {
    const domain = await this.domainRepo.findOne(id);
    if (!domain) {
      throw new NotFoundException(`Domain not found`)
    }
    return this.domainRepo.remove(domain);
  }

  // ************************************************************************
  // Predicate functions
  // ************************************************************************

  /* returns true of domain name already exists for given acct_id */
  async domainExist(acct_id: number, name: string): Promise<boolean> {
    const domain = await getRepository(Domain)
      .createQueryBuilder("domain")     
      .where("domain.acct_id = :acct_id", { acct_id })
      .andWhere("domain.name = :name", { name })
      .getOne();
    return domain ? true : false;
  }
}
