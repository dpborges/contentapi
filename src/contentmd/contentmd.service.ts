import { CopyContentmdDto } from './dto/copy-contentmd.dto';
import { Injectable, Query, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository } from 'typeorm';
import * as R from 'ramda';
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
   * Creates a content meta data record in database. It ensures the domain exist
   * within the acct_id and the slug does not already exist
   * @param contentmdDto 
   * @returns Promise<Contentmd>
   */
  async create(contentmdDto: CreateContentmdDto) {
    let { domain_name, acct_id } = contentmdDto;

    /* ensure domain name for the given acct_id exists  */
    let domainList = await this.domainService.findAllByAcctId(acct_id);
    let foundDomain = domainList.find(domain => domain.name === domain_name)

    // const targetDomain = await this.domainService.findOne(contentmdDto.domain_id)
    if (!foundDomain) {
      throw new NotFoundException(`domain '${contentmdDto.domain_name}' does not exists `)
    } 
   
    console.log("FOUND DOMAIN ", foundDomain)

    /* checks to see if this is duplicate content */
    const isDuplicate = await this.isDuplicate(foundDomain.id, contentmdDto);
    console.log("THE VALUE OF IS DUPLICATE IS FROM create FUNCTION", isDuplicate);    
    if (isDuplicate) {
      throw new ConflictException(`Content already exists with this same slug, filename and filetype in '${domain_name}' domain.`)
    } 
        
    console.log("THIS INSTANCE OF CONTENTMD ");
    console.log(JSON.stringify(contentmdDto,null,2));
    
    /* create instance of Content Metadata */
    const newContentMd = this.contentmdRepo.create(contentmdDto);
    /* tack on the domain entity to the contentmd instance */
    newContentMd.domain = foundDomain;
    /* save to repository */
    return this.contentmdRepo.save(newContentMd);
  }

  findAll(acct_id: number, domain_name: string) {
    const domain = this.domainService.findByName(acct_id, domain_name);
    return getRepository(Contentmd)  // this is table
      .createQueryBuilder('contentmd') // this is alias
      .innerJoinAndSelect('contentmd.domain', 'domain')
      .where("contentmd.acct_id = :acct_id", { acct_id })
      // .andWhere("contentmd.domain_id = :domain_id", { domain_id })
      .orderBy("contentmd.create_date", "DESC")
      // .printSql()
      .getMany();
  }

  /**
   * find all content meta data records within the given domain
   * @param domain_id 
   * @returns Contentmd[]
   */
  // findAllByAcctAndDomainId(acct_id: number, domain_name: string) {  
  //   return getRepository(Contentmd)  // this is table
  //     .createQueryBuilder('contentmd') // this is alias
  //     .innerJoinAndSelect('contentmd.domain', 'domain')
  //     .where("contentmd.acct_id = :acct_id", { acct_id })
  //     .andWhere("contentmd.domain_id = :domain_id", { domain_id })
  //     .orderBy("contentmd.create_date", "DESC")
  //     // .printSql()
  //     .getMany();
  // }

  /**
   * find all content meta data records within the given domain
   * @param acct_id 
   * @param domain_id 
   * @param slug
   * @returns Contentmd
   */
   findByAcctDomainIdAndSlug(acct_id: number, domain_id: number, slug: string) {  
    return getRepository(Contentmd)  // this is table
      .createQueryBuilder('contentmd') // this is alias
      .innerJoinAndSelect('contentmd.domain', 'domain')  // join column, join entity
      .where("contentmd.acct_id = :acct_id", { acct_id })
      .andWhere("contentmd.domain_id = :domain_id", { domain_id })
      .andWhere("contentmd.slug = :slug", { slug })
      .printSql()
      .getOne();
  }

  /**
   * Get content metadata record by id
   * @param id 
   * @returns Promise<Contentmd>
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

  /**
   * Requirement: be able to copy content from one domain (eg. staging) to a
   * another (eg.production). Whenever I update or make a correction to content,
   * I should be able to copy/replace content in the target domain (eg production).
   * To ensure I am replacing the correct content I will be matching on slug.
   * @param id 
   * @param copyContentmdDto
   * @returns Contentmd
   */
  async copy(id: number, copyContentmdDto: CopyContentmdDto) {
    /* check if source content id exists */
    let sourceContent: any = await this.contentmdRepo.findOne(id);
    if (!sourceContent) { 
      throw new NotFoundException(`Content id:(${id}) was not found`)
    }

    /* set the copyToDomain provided on request body, otherwise default to source domain */
    const { name: sourceDomainName } = sourceContent.domain;
    const { domain_name: targetDomainName } = copyContentmdDto;
    const copyToDomain = targetDomainName ? targetDomainName : sourceDomainName;
    
    /* Cast sourceContent to the CreateContentDto type by updating sourceContent properties 
       to align with CreateContentmdDto */
    sourceContent.domain_name = copyToDomain;  /* add the domain name */
    delete sourceContent.id;                   /* delete domain relation */
    delete sourceContent.domain;               /* delete domain relation */
    delete sourceContent.domain_id;            /* delete the domain_id */
    let targetContent: CreateContentmdDto = {
      ...sourceContent,
      copyContentmdDto
    } 
    let newContentCopy = await this.create(targetContent)
    return newContentCopy;
    // return sourceContent;
    // return sourceContent;
    // return this.contentmdRepo.remove(existingContentmd);
    // return this.contentmdRepo.findOne(id);
  }


  // ************************************************************************
  // Predicate functions
  // ************************************************************************
  /* returns true of record exist with same domain_id, slug, content_type, and file_type */
  async isDuplicate(domain_id: number, contentmdDto: CreateContentmdDto): Promise<boolean> {
    const { slug, content_type, file_type } = contentmdDto;

    const contentmdInstance = await getRepository(Contentmd)
      .createQueryBuilder("contentmd")     
      .where("contentmd.domain_id = :domain_id", { domain_id })
      .andWhere("contentmd.slug = :slug", { slug })
      .andWhere("contentmd.content_type = :content_type", { content_type })
      .andWhere("contentmd.file_type = :file_type", { file_type })
      .getOne();

      return  contentmdInstance ? true : false;
}

}
