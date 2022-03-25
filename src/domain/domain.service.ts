import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDomainDto } from './dto/create-domain.dto';
import { UpdateDomainDto } from './dto/update-domain.dto';
import { Domain } from './entities/domain.entity';
import { isNullOrUndefined } from 'util';


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

  // findAllByAcctId(acct_id) {
  //   return getRepository(Domain)
  //     .createQueryBuilder("domain")     
  //     .where("domain.acct_id = :acct_id", { acct_id })
  //     .getMany();
  // }

  /* get all domains in a givent acct_id */
  findAllByAcctId(acct_id: number) {
    return this.domainRepo.find({
      where: {
        acct_id
      }
    });  
  }

  // findByName(acct_id: number, name: string) {
  //   return getRepository(Domain)
  //     .createQueryBuilder("domain")   
  //     .where("domain.acct_id = :acct_id", { acct_id })  
  //     .andWhere("domain.name = :name", { name })
  //     .getOne();
  // }

  /* find id by name */
  async findByName(acct_id: number, name: string) {
    const [ domain ] = await this.domainRepo.find({
      where: {
        acct_id,
        name
      }
    });  
    if (!domain) { throw new NotFoundException(`Domain '${name}' not found`) }
    return domain;
  }

  findById(acct_id: number, id: number) {
    if (!id) {   // needed for sqlite, otherwise findOne below will still return first found
      return null;
    }
    // const [domain] = await 
    return this.domainRepo.findOne({
      where: {
        acct_id,
        id
      }
    });  
  }

  // findOne(id: number) {
  //   if (!id) {   // needed for sqlite, otherwise findOne below will still return first found
  //     return null;
  //   }
  //   return this.domainRepo.find({
  //     where: {
  //       acct_id,
  //       id
  //     }
  //   });  
  // }

  /* update domain name or base_url */
  async update(id: number, updateDomainDto: UpdateDomainDto) {
    let { acct_id } = updateDomainDto;
    /* retrieve domain instance with given id  */
    let domain = await this.findById(acct_id, id);
    if (!domain) {
      throw new NotFoundException(`Domain does not exist`)
    }
    /* update  domain */
    let updatedDomain = Object.assign(domain, updateDomainDto)
    delete updatedDomain.update_date;   /* delete the update, so it gets updated */
    return this.domainRepo.save(updatedDomain);
  }

  async remove(acct_id: number, id: number) {
    const domain = await this.findById(acct_id, id);
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
    let domain = undefined;
    try {
      domain = await this.findByName(acct_id, name)
    } catch (err) { /* do nothing as you want to return false if it fails to find domain */  }
    return domain ? true : false;
  }
}
