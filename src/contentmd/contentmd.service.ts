import { PartialType } from '@nestjs/mapped-types';
// import { PromoteContentmdDto } from './dto/promote-contentmd.dto';
import { Injectable, Query, ConflictException, 
         NotFoundException, NotAcceptableException, BadRequestException } 
from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getRepository, Connection } from 'typeorm';
import * as R from 'ramda';
import { CreateContentmdDto } from './dto/create-contentmd.dto';
import { UpdateContentmdDto } from './dto/update-contentmd.dto';
import { Contentmd } from './entities/contentmd.entity';
import { Domain } from '../domain/entities/domain.entity';
import { DomainService } from '../domain/domain.service';
import { PromotionService } from '../promotion/promotion.service';
import { Promotion } from '../promotion/entities/promotion.entity';

@Injectable()
export class ContentmdService {
    
  constructor(
    private domainService: DomainService,
    private promotionService: PromotionService,
    private readonly connection: Connection,
    @InjectRepository(Contentmd) private contentmdRepo: Repository<Contentmd>,
    @InjectRepository(Domain) private domainRepo: Repository<Domain>,
    // @InjectRepository(Promotion) private promotionRepo: Repository<Promotion>,
  ) {}

  /**
   * Creates a content meta data record in database. It ensures the domain exist
   * within the acct_id and then checks that the slug does not already exist
   * @param acct_id
   * @param contentmdDto 
   * @returns Promise<Contentmd>
   */
  async create(acct_id: number, createContentmdDto: CreateContentmdDto) {
    let { domain_name } = createContentmdDto;

    /* ensure domain name for the given acct_id exists  */
    let foundDomain = await this.domainService.findByName(acct_id, domain_name);
    if (!foundDomain) {
      console.log("DID NOT FIND DOMAIN ", domain_name)
      throw new NotFoundException(`domain '${createContentmdDto.domain_name}' does not exists `)
    } 

    /* checks to see if this is duplicate content */
    const isDuplicate = await this.isDuplicate(foundDomain.id, createContentmdDto);
    if (isDuplicate) {
      throw new ConflictException(`Content already exists with this same slug, filename and filetype in '${domain_name}' domain.`)
    } 
        
    /* create instance of Content Metadata */
    const newContentMd = this.contentmdRepo.create(createContentmdDto);
    console.log("This is a contentmd entity")
    console.log(JSON.stringify(newContentMd,null,2))
    /* tack on the domain entity as nested object, acct_id and domain_name*/
    newContentMd.domain  = foundDomain;
    newContentMd.acct_id = acct_id;
    /* save to repository */
    console.log("This is a contentmd entity after tacking on acctid and domain")
    console.log(JSON.stringify(newContentMd,null,2))
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
   async findById(acct_id: number, id: number): Promise<Contentmd> {  
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
   * Promote Content from current domain to another domain, by content id or slug.
   * If slug is provided, we look up the contentmd id for the matching slug and fromDomain.
   * The rest of the promote logic and promotion table updates will be based onsr
   * */
  async promote(sessionObj, idOrSlug, fromDomainName, toDomainName, useSlugAsId) {
    const { acct_id, creator_id } = sessionObj;
    /* separate id and slugId vars based on whether useSlugAsId parm is passed   */
    let id:   number = !useSlugAsId || useSlugAsId === "false" ? parseInt(idOrSlug) : 0;
    let slug: string =  useSlugAsId && useSlugAsId === "true"  ? idOrSlug : "";

    /* ensure user provided the toDomain query parameter  */
    if (!toDomainName) { throw new BadRequestException(`The toDomain parameter is required`)};
    /* ensure toDomain exists  */
    const toDomainEntity = await this.domainService.findByName(acct_id, toDomainName);
    if (!toDomainEntity) { throw new BadRequestException(`The toDomain '${toDomainName} does not exist.`)};

    // initialize process variables
    let fromContentmd: Contentmd;  /* source contentmd record */
    let toContentmd: Partial<Contentmd>[];
    // let from_content_id = null;    /* source contentmd id */

    // if useSlugAsId was specified, look up the source contentmd record using slug/domain, otherwise lookup by id 
    if (slug)  { /* find by slug */
      fromContentmd = await this.findBySlug(acct_id, fromDomainName, slug);
    } else {     /* find by id */
      fromContentmd = await this.findById(acct_id, id);
    }

    // throw exception if neither id or slug was provided
    if (!fromContentmd) { 
      let idUsedForException = id ? id : slug;
      throw new NotFoundException(`Content id:(${idUsedForException}) was not found`)
    }

    /* obtain fromDomain id and the fromContentmd_id  */
    let { id:   fromContentmdId } = fromContentmd;
    let { id:   fromDomainId }  = fromContentmd.domain;
    /* throw exception if domains are same, as you cannot promote conent witin same domain */
    this.throwExceptionIfSame(toDomainName, fromDomainName); 

    /* ensure this is not a reverse promotion */
    const isReversePromo = await this.promotionService.isReversePromotion(acct_id, fromDomainId, fromContentmdId, toDomainEntity.id);
    if (isReversePromo) {throw new ConflictException(`Content you're trying to promote already exists and originated from the '${toDomainName}' domain`)}

    /* look up src id and domain id in promotion table to see if this content had
       previously been promoted. */
    let sourceEntry = await this.promotionService.getEntryByContentmdId(acct_id, fromDomainId, fromContentmdId);

    // Create new Query Runner for managing transactions
    const queryRunner = this.connection.createQueryRunner();  // create new QueryRunner

    // handles case where content gets promoted for first time (relates the 2 contentmd records)
    // and case where it was content is being promoted a subsequent time.
    // case#1 - if source entry not found in promotion table (no entry means source was never promoted), create
    //          target contentmd and link source and target contentmd's in promotion table
    // case#2 - if source entry found, use target contentmd id, in promotion table, to push contentmd to target domain
    if (!sourceEntry) { //case#1
      console.log("Inside CASE#1")
      /* establish connection and start transaction */
      await queryRunner.connect();           // establish connection
      await queryRunner.startTransaction();  // start transaction 

      try {       
        /* create modify directive to tweak contentmd in order to save it to target domain for first time   */
        let modDirective =  { 
          objInstance: fromContentmd,
          addProps: { creator_id: sessionObj.creator_id, domain: toDomainEntity, domain_id: toDomainEntity.id },
          deleteProps: ['id', 'create_date', 'update_date']
        }
        let modifiedContentmd = this.modifyContentmdInstance(modDirective); 

        /* rebuild the content_id string to replace src domain name with target domain name */
        let awsS3Id = this.awsS3IdBuild(sessionObj.acct_id, toDomainName, modifiedContentmd.slug, modifiedContentmd.title )
        /* update the content_id string with the rebuilt id using target domain */
        modifiedContentmd.content_id = awsS3Id;
      
        /* create contentmd instance in target domain */
        let contentmdEntity = this.contentmdRepo.create(modifiedContentmd);
        toContentmd = await queryRunner.manager.save(contentmdEntity);
        
        /* Link the 2 entries in the promotion table */
        /* save source entry*/
        sourceEntry = await this.promotionService.saveEntry(acct_id, fromContentmd, 0, 0);
        /* link and save target entry*/
        let parent_contentmd_id = fromContentmdId;
        let parent_id = sourceEntry.id;
        let targetEntry = await this.promotionService.saveEntry(acct_id, toContentmd, parent_contentmd_id,  parent_id);
        
        // Commit transaction
        await queryRunner.commitTransaction();

      } catch (err) {
        console.log(`Transaction has been rolled back`)
        console.log(err)
        await queryRunner.rollbackTransaction(); // Rollback entire transaction on error
      } finally {
        await queryRunner.release();  // release/close queryRunner
      }
  } else {  // case#2 - found source entry
      console.log("Inside CASE#2")

      /* check if src entry has a promotion relation in target domain. Do this by checking 
         to see if src entry row id exist as a parent id in target domain. */

      /* Look for an entry in the target domain where parent_id is equal to src entry id */
      let tgtEntry = await this.promotionService.getEntryByParentId(acct_id, toDomainEntity.id, sourceEntry.id);

      /* pull the target contentmd id */
      let tgtContentmdId = tgtEntry.contentmd_id;
      
      /* define mod directive to clone and modify the fromContentmd record so it can be saved in 
         target domain using tgt contentmd id and no update_date. The update_date will automatilly be updated */
      let modDirective =  { 
        objInstance: fromContentmd,
        addProps: { creator_id: sessionObj.creator_id, domain_id: toDomainEntity.id, id: tgtContentmdId },
        deleteProps: ['domain', 'update_date']
      }
      let modifiedContentmd = this.modifyContentmdInstance(modDirective); 
      
      /* use the target contentmd id to promote/save the content in target domain */
      let contentmdEntity = this.contentmdRepo.create(modifiedContentmd);
      toContentmd = await queryRunner.manager.save(contentmdEntity);
    }     

    console.log("This is target object being saved and returned")
    console.log(JSON.stringify(toContentmd,null,2))
    return toContentmd;

  }

  // ************************************************************************
  // Predicate functions
  // ************************************************************************
  /* returns 'true' of record exist with same domain_id, slug, content_type, and file_type */
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
  throwExceptionIfSame(fromDomain, toDomain) {
    if (fromDomain === toDomain) { 
      let errMsg = `Cannot promote content within same '${fromDomain}' domain.`;
      throw new NotAcceptableException(errMsg)
    }
  }
  /**
   * Takes a modDirective (or modification directive) in order to make changes to source
   * contentmd record before saving in target domain. For example, deleting the id 
   * property from source contentmd record, so one a new unique id is automatically generated 
   * for target.
   * @param   modDirective
   * @returns Contentmd
   */
  modifyContentmdInstance({objInstance, addProps, deleteProps }) {
    const { creator_id, domain, domain_id, id  } = addProps;
    const toDeletePropsArray = deleteProps;
    
    // Pipe functions
    const cloneObjectInstance = (objInstance) => {
      return objInstance
    }

    const addCreatorId = (objInstance) => {
      if (!creator_id) return objInstance
      const creatorLens = R.lensProp('creator_id');
      return R.set(creatorLens, creator_id, objInstance);
    }

    const addDomainId = (objInstance ) => {
      if (!domain_id) { return objInstance};
      const domainLens = R.lensProp('domain_id');
      return R.set(domainLens, domain_id, objInstance);
    }

    const addDomain = (objInstance ) => {
      if (!domain) { return objInstance};
      const domainLens = R.lensProp('domain');
      return R.set(domainLens, domain, objInstance);
    }

    const addPrimaryId = (objInstance) => {
      if (!id) {return objInstance};
      const idLens = R.lensProp('id');
      const newInstance = R.set(idLens, id, objInstance);
      return newInstance;
    }

    /* delete all properties, from objInstance, specified in array */
    const deleteProperties = (objInstance) => {
      toDeletePropsArray.forEach(prop => delete objInstance[prop])
      return objInstance;
    }

    const modify = R.pipe(
        cloneObjectInstance,
        addPrimaryId,
        addCreatorId,
        addDomainId,
        addDomain,
        deleteProperties
    )
      
    const modifiedInstance = modify(objInstance);

    return modifiedInstance;
  }

  /** 
   * Build S3 id (aka path) where suffix resolves in precedence order. This allows you
   * to pass multiple suffixes. If one is undefined it will default to the other. 
   * For example, if you pass slug as pimarySfx and title as secondarySfx and slug is undefined, 
   * the title will be used as the suffix.
   * @param   acctId
   * @param   domainName
   * @param   primarySfx
   * @param   secondarySfx
   * @returns string
   * */ 
  awsS3IdBuild = (acctId, domainName, primarySfx, secondarySfx) => {
    let suffix = primarySfx || secondarySfx;
    return `${acctId}/${domainName}/${suffix}`;
  }
  
  /**
   * Splits out the awsS3Id so you can destructure the result  
   * @param s3Id
   * @returns string[]
   **/ 
  awsS3IdSplit  = (s3Id) => {
    return s3Id.split('/')
  }

}
