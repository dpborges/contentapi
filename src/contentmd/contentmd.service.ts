import { Injectable, Query, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import { CreateContentmdDto } from './dto/create-contentmd.dto';
import { UpdateContentmdDto } from './dto/update-contentmd.dto';
import { Contentmd } from './entities/contentmd.entity';
import { Domain } from '../domain/entities/domain.entity';
import { DomainService } from '../domain/domain.service';

@Injectable()
export class ContentmdService {

  constructor(
    private domainService: DomainService,
    @InjectRepository(Contentmd) private contentmdRepo: Repository<Contentmd>,
    @InjectRepository(Domain) private domainRepo: Repository<Domain>,
  ) {}

  /**
   * Creates a content meta data record in database. It ensures the domain id exist
   * and the slug does not already exist
   * @param contentmdDto 
   * @returns Promise<Contentmd>
   */
  // async create(contentmdDto: CreateContentmdDto) {
  //   /* ensure domain id for the given acct_id exists  */
  //   const targetDomain = await this.domainService.findOne(contentmdDto.domain_id)
  //   if (!targetDomain) {
  //     throw new NotFoundException(`domain '${contentmdDto.domain_id}' does not exists `)
  //   } 
  //   /* ensure slug does not already exist within the given domain_id */
  //   const slugExist = await this.slugExist(contentmdDto.domain_id, contentmdDto.slug);
  //   if (slugExist) {
  //     throw new ConflictException(`Slug '${contentmdDto.slug}' already exists `)
  //   } 
        
  //   /* create instance of Content Metadata */
  //   const newContentMd = this.contentmdRepo.create(contentmdDto);
  //   /* tack on the domain entity to the contentmd instance */
  //   // newContentMd.domain = targetDomain;
  //   /* save to repository */
  //   return this.contentmdRepo.save(newContentMd);
  // }

  async create(contentmdDto: CreateContentmdDto) {
    let { domain_name, acct_id } = contentmdDto;
    /* ensure domain name for the given acct_id exists  */
    let domainList = await this.domainService.findAllByAcctId(acct_id);
    let foundDomain = domainList.find(domain => domain.name === domain_name)

    /* ensure domain id for the given acct_id exists  */
    // const targetDomain = await this.domainService.findOne(contentmdDto.domain_id)
    if (!foundDomain) {
      throw new NotFoundException(`domain '${contentmdDto.domain_name}' does not exists `)
    } 
    /* ensure slug does not already exist within the given domain_id */
    const slugExist = await this.slugExist(foundDomain.id, contentmdDto.slug);
    if (slugExist) {
      throw new ConflictException(`Slug '${contentmdDto.slug}' already exists `)
    } 
        
    /* create instance of Content Metadata */
    const newContentMd = this.contentmdRepo.create(contentmdDto);
    /* tack on the domain entity to the contentmd instance */
    newContentMd.domain = foundDomain;
    /* save to repository */
    return this.contentmdRepo.save(newContentMd);
  }




  findAll() {
    return `This action returns all contentmd`;
  }

  /**
   * find all content meta data records within the given domain
   * @param domain_id 
   * @returns Contentmd[]
   */
  findAllByDomainId(domain_id: number) {  
    return getRepository(Contentmd)  // this is table
      .createQueryBuilder('contentmd') // this is alias
      .innerJoinAndSelect('contentmd.domain', 'domain')    
      .orderBy("contentmd.create_date", "DESC")
      // .printSql()
      .getMany();
  }

  /**
   * Get content metadata record by id
   * @param id 
   * @returns Contentmd
   */
  findOne(id: number) {
    if (!id) {   // needed for sqlite, otherwise findOne below will still return first found
      return null;
    }
    return this.contentmdRepo.findOne(id)
  }

  /**
   * Updates selective properties that are in UpdateContentmdDto
   * @param id 
   * @param updateContentmdDto 
   * @returns Contentmd
   */
  async update(id: number, updateContentmdDto: UpdateContentmdDto) {
    /* retrieve instance of contentmd */
    let currentContentmd = await this.contentmdRepo.findOne(id);
    if (!currentContentmd) {
      throw new NotFoundException(`Content id: ${id} not found`)
    }
    /* update  contentmd */
    let updatedContentmd = Object.assign(currentContentmd, updateContentmdDto)
    return this.contentmdRepo.save(updatedContentmd);
  }

  // update(id: number, updateContentmdDto: UpdateContentmdDto) {
  //   return `This action updates a #${id} contentmd`;
  // }

  /**
   * Deletes an existing content metadata record
   * @param id 
   * @returns Contentmd
   */
  async remove(id: number) {
    const existingContentmd = await this.contentmdRepo.findOne(id);
    if (!existingContentmd) {
      throw new NotFoundException(`Content metadata id:(${id}) was not found`)
    }
    return this.contentmdRepo.remove(existingContentmd);
  }

  // ************************************************************************
  // Predicate functions
  // ************************************************************************

  /* returns true of domain name already exists for given acct_id */
  async slugExist(domain_id: number, slug: string): Promise<boolean> {
    const domain = await getRepository(Contentmd)
      .createQueryBuilder("contentmd")     
      .where("contentmd.domain_id = :domain_id", { domain_id })
      .andWhere("contentmd.slug = :slug", { slug })
      .getOne();
    return domain ? true : false;
  }
}
