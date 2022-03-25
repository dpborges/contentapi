import { PromoteContentmdDto } from './dto/promote-contentmd.dto';
import { Injectable, Query, ConflictException, 
         NotFoundException, NotAcceptableException, BadRequestException } 
from '@nestjs/common';
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
   * within the acct_id and then checks that the slug does not already exist
   * @param acct_id
   * @param contentmdDto 
   * @returns Promise<Contentmd>
   */
  async create(acct_id: number, contentmdDto: CreateContentmdDto) {
    let { domain_name } = contentmdDto;

    /* ensure domain name for the given acct_id exists  */
    let foundDomain = await this.domainService.findByName(acct_id, domain_name);
    if (!foundDomain) {
      throw new NotFoundException(`domain '${contentmdDto.domain_name}' does not exists `)
    } 

    /* checks to see if this is duplicate content */
    const isDuplicate = await this.isDuplicate(foundDomain.id, contentmdDto);
    if (isDuplicate) {
      throw new ConflictException(`Content already exists with this same slug, filename and filetype in '${domain_name}' domain.`)
    } 
        
    /* create instance of Content Metadata */
    const newContentMd = this.contentmdRepo.create(contentmdDto);
    /* tack on the domain entity to the contentmd instance and the acct_id*/
    newContentMd.domain  = foundDomain;
    newContentMd.acct_id = acct_id;
    /* save to repository */
    return this.contentmdRepo.save(newContentMd);
  }

  async findAll(acct_id: number, domainName: string, sortAscBy: string, sortDescBy: string) {
    /* resolve domain name */
    domainName = domainName ? domainName : "default"; // if no domain_name provided, use default
    /* see if user provided a sort query parm, if not, use default DESC order on create_date */
    const sortField = this.determineSortField(sortAscBy, sortDescBy);
    /* look up domain and pull out its id to join with contentmd*/
    const domain = await this.domainService.findByName(acct_id, domainName);
    const domain_id = domain.id;

    /* get contentmd records */
    return getRepository(Contentmd)    // this is table
      .createQueryBuilder('contentmd') // this is alias
      .innerJoinAndSelect('contentmd.domain', 'domain')
      .where("contentmd.acct_id = :acct_id", { acct_id })
      .andWhere("contentmd.domain_id = :domain_id", { domain_id })
      .orderBy(`contentmd.${sortField.name}`, sortField.order)
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
   * Get content metadata record by content id or by using slug as id
   * @param {number} acct_id 
   * @param {string | number}idOrSlug 
   * @param {string} domainName
   * @param {string} useSlugAsId 
   * @returns Promise<Contentmd>
   */
   findByIdOrSlug(acct_id: number, idOrSlug: string, domainName: string, useSlugAsId: string) {
    if (!idOrSlug) {   // needed for sqlite, otherwise findOne below will still return first found
      return null;
    }
    /* resolve domain name */
    domainName = domainName ? domainName : "default"; // if no domain_name provided, use default
    /* determine if user sent id or slug and separate variables  */
    let id:     number = !useSlugAsId || useSlugAsId === "false" ? parseInt(idOrSlug) : 0;
    let slugId: string =  useSlugAsId && useSlugAsId === "true"  ? idOrSlug : "";
    /* route call to appropriate method based on whether using id or slugId */
    if (id) {  
      return this.contentmdRepo.findOne(id)
    } else if (slugId) {
      return this.findBySlug(acct_id, domainName, slugId)
    }
  }

  /**
   * find content by slug for given domain
   * @param acct_id 
   * @param domainName 
   * @param slug
   * @returns Contentmd
   */
   async findBySlug(acct_id: number, domainName: string, slug: string) {  
    const domainEntity = await this.domainService.findByName(acct_id, domainName)
    const domain_id = domainEntity.id;
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
   * find content by id for the given domain
   * @param acct_id 
   * @param id
   * @returns Contentmd
   */
   async findById(acct_id: number, id: number) {  
    const [ contentmdEntity ] = await this.contentmdRepo.find({
      where: {
        acct_id,
        id
      }
    }); 
    if (!contentmdEntity) { throw new NotFoundException(`Content id: ${id} not found`) }
    return contentmdEntity; 
  }
 
  /**
   * Updates selective properties that are in UpdateContentmdDto
   * @param acct_id 
   * @param id 
   * @param updateContentmdDto 
   * @returns Contentmd
   */
  async update(acct_id: number, id: number, updateContentmdDto: UpdateContentmdDto) {
    /* retrieve instance of contentmd */
    let currentContentmd = await this.findById(acct_id, id);
    /* update  contentmd instance*/
    let updatedContentmd = Object.assign(currentContentmd, updateContentmdDto)
    /* save  contentmd instance*/
    return this.contentmdRepo.save(updatedContentmd);
  }

  // update(id: number, updateContentmdDto: UpdateContentmdDto) {
  //   return `This action updates a #${id} contentmd`;
  // }

  /**
   * Deletes an existing content metadata record
   * @param {number} acct_id 
   * @param {number} id 
   * @returns {Object} Contentmd
   */
  async remove(acct_id: number, id: number): Promise<Contentmd> {
    const existingContentmd = await this.findById(acct_id, id); /* throws exception if not found*/
    return this.contentmdRepo.remove(existingContentmd);
  }



  /**
   * Promote Content from current domain to another domain, by contentid or slug.
   * @param {number} id 
   * @param {Object} copyContentmdDto
   * @returns {Object} Contentmd
   */
  async promote(acct_id, idOrSlug, fromDomain, toDomain, useSlugAsId) {
    /* determine if user sent id or slug and separate variables  */
    let id:     number = !useSlugAsId || useSlugAsId === "false" ? parseInt(idOrSlug) : 0;
    let slugId: string =  useSlugAsId && useSlugAsId === "true"  ? idOrSlug : "";

    /* ensure user provided the toDomain query parameter  */
    if (!toDomain) { throw new BadRequestException(`The toDomain parameter is required`)};
    /* ensure toDomain exists  */
    const toDomainEntity = await this.domainService.findByName(acct_id, toDomain);
    if (!toDomainEntity) { throw new BadRequestException(`The toDomain '${toDomain} does not exist.`)};

     /* Handle case when contentmd id is provided */
     if (id) {
      /* check if source content id exists */
      let fromContentmd = await this.findById(acct_id, id);
      if (!fromContentmd) { 
        throw new NotFoundException(`Content id:(${id}) was not found`)
      }
      /* obtain fromDomain from the sourceContentmd entity */
      let { name: fromDomain }  = fromContentmd.domain;
       /* throw exeption if fromDomain and toDomain are thesame  */
      this.raiseErrorIfSame(toDomain, fromDomain);
      
      let toContentmd: PromoteContentmdDto = this.transformToPromoteDto(fromContentmd, toDomain)


      return toContentmd;
    }

    /* Handle case when slug is provided as id */ 
    if (slugId) {
      /* ensure fromDomain is provided, if not, set it to default domain  */
      if (!fromDomain) { fromDomain = 'default'};
      /* throw exeption if fromDomain and toDomain are thesame  */
      this.raiseErrorIfSame(toDomain, fromDomain);
    }

   
    

      
    /* Cast sourceContent to the CreateContentDto type by updating sourceContent properties 
       to align with CreateContentmdDto */
    // sourceContent.domain_name = copyToDomain;  /* add the domain name */
    // delete sourceContent.id;                   /* delete domain relation */
    // delete sourceContent.domain;               /* delete domain relation */
    // delete sourceContent.domain_id;            /* delete the domain_id */
    // let targetContent: CreateContentmdDto = {
    //   ...sourceContent,
    //   copyContentmdDto
    // } 
    // let newContentCopy = await this.create(targetContent)
    // return newContentCopy;
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

  // ************************************************************************
  // Helper Functions
  // ************************************************************************
  /* This function determines which of 2 possible query parameters were used
     and converts it into an object with field name and order (eg. ASC). Since
     the property values in the boject will be used to construct a query, they 
     should reflect actual database column name and syntax (eg. ASC , DESC) */
  determineSortField(sortAscBy: string, sortDescBy: string): any {
    let dbSortField = "create_date"; /* set default sort field */
    if (sortAscBy) {
      if (sortAscBy.toLowerCase() === "createdate") { dbSortField = "create_date "};
      return { name: dbSortField, order: "ASC"}
    } else if (sortDescBy) {
      if (sortDescBy.toLowerCase() === "createdate") { dbSortField = "create_date "};
      return { name: dbSortField, order: "DESC"}
    } else return { name: dbSortField, order: "DESC"};  /* if no sortfield, set default */
  }

  /* Throws and exception if the toDomain you are promoting to is same as fromDomain */
  raiseErrorIfSame(fromDomain, toDomain) {
    if (fromDomain === toDomain) { 
      let errMsg = `Cannot promote content within same '${fromDomain}' domain.`;
      throw new NotAcceptableException(errMsg)
    }
  }

  transformToPromoteDto(fromContentmd, toDomain) {
    /* change domain name to the toDomain */
    fromContentmd.domain_name = toDomain;   

    /* delete properties that are not in the create contentmd dto   */
    delete fromContentmd.id;                   /* delete contentmd id */
    delete fromContentmd.domain;               /* delete the domain nested object */
    delete fromContentmd.domain_id;            /* delete the domain_id */
    
    return fromContentmd;
  }

 
  

}
