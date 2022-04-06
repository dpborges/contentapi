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

    // intialize process variables
    let fromContentmd: Contentmd;  /* source contentmd record */
    // let from_content_id = null;    /* source contentmd id */

    // if slugId was used, look up the source contentmd record using slug/domain, otherwise lookup by id 
    if (slug)  { /* find by slug */
      fromContentmd = await this.findBySlug(acct_id, fromDomainName, slug);
    } else {     /* find by id */
      fromContentmd = await this.findById(acct_id, id);
    }

    // throw exception if neither id or slug was found above
    if (!fromContentmd) { 
      let idUsedForException = id ? id : slug;
      throw new NotFoundException(`Content id:(${idUsedForException}) was not found`)
    }

    /* obtain fromDomain id and the fromContentmd_id  */
    let { id:   fromContentmdId } = fromContentmd;
    let { id:   fromDomainId }  = fromContentmd.domain;
    /* throw exception if domains are same */
    this.throwExceptionIfSame(toDomainName, fromDomainName); /* cannot promote to same domain */
    
   
    // if (fromContentmd) {  
    // from_content_id = id;

    /* check if source content id exists */
    // fromContentmd = await this.findById(acct_id, id);
    console.log("This is the fromContentmd")
    console.log(JSON.stringify(fromContentmd, null, 2))
    // if (!fromContentmd) { 
    //   throw new NotFoundException(`Content id:(${id}) was not found`)
    // }

    // /* obtain fromDomain name and the fromContentmd_id  */
    // let { name: fromDomainName }  = fromContentmd.domain;
    // let { id:   fromContentmdId } = fromContentmd;

    // this.throwExceptionIfSame(toDomainName, fromDomainName); /* cannot promote to same domain */

    /* look up src id and domain id in promotion table to see if this content had
        previously been promoted. */
    console.log(`Calling getSourceEntry() with acct_id:${acct_id}, from did:${fromDomainId} from_content_id:${fromContentmdId}`)
    let sourceEntry = await this.promotionService.getSourceEntry(acct_id, fromDomainId, fromContentmdId);

    // Create new Query Runner
    const queryRunner = this.connection.createQueryRunner();  // create new QueryRunner

    // handles case where content gets promoted for first time (relates the 2 contentmd records)
    // and case where it was content is being promoted a subsequent time.
    // case#1 - link both contendmd objects if source entry not found in promotion table; hence never promoted
    // case#2 - if source entry found, use target contentmd id, in promotion table, to push contentmd to target domain
    if (!sourceEntry) { //case#1
      console.log("The sourcEntry was NOT FOUND, link the two entries  ");

      /* establish connection and start transaction */
      await queryRunner.connect();           // establish connection
      await queryRunner.startTransaction();  // start transaction 

      try {                                  // Wraps transaction code in a 
        /* clone and modify the fromContentmd record so it can be saved in target domain */
        // let modifiedContentmd = 
        //   this.modifyContentmd(fromContentmd, toDomainEntity, false, sessionObj); /* updates target domain */
        /* create modify directive to tweak contentmd in order to save it to target domain for first time   */
        console.log("CASE#1 toDomainEntity")
        console.log(JSON.stringify(toDomainEntity,null,2))
        let modDirective =  { 
          objInstance: fromContentmd,
          addProps: { creator_id: sessionObj.creator_id, domain: toDomainEntity, domain_id: toDomainEntity.id },
          deleteProps: ['id', 'create_date', 'update_date']
        }
        let modifiedContentmd = this.modifyContentmdInstance(modDirective); 
        console.log(`This is Modified source content`)
        console.log(`${JSON.stringify(modifiedContentmd,null,2)}`)
        let contentmdEntity = this.contentmdRepo.create(modifiedContentmd);
        let toContentmd = await queryRunner.manager.save(contentmdEntity);
        console.log(`This is toContentmd Saved in the target`)
        console.log(`${JSON.stringify(toContentmd,null,2)}`)
        /* Link the 2 entries in the promotion table */
        sourceEntry = await this.promotionService.saveEntry(acct_id, fromContentmd, 0, 0);
        console.log(`This is first entry created in the promotion table`)
        console.log(`${JSON.stringify(sourceEntry,null,2)}`)
        let parent_contentmd_id = fromContentmdId;
        let parent_id = sourceEntry.id;
        let targetEntry = await this.promotionService.saveEntry(acct_id, toContentmd, parent_contentmd_id,  parent_id);
        console.log(`This is target entry created in the promotion table`)
        console.log(`${JSON.stringify(targetEntry,null,2)}`)

        // Commit transaction
      await queryRunner.commitTransaction();

      } catch (err) {
        console.log(`Transaction has been rolled back`)
        console.log(err)
        await queryRunner.rollbackTransaction(); // Rollback entire transaction on error
      } finally {
        await queryRunner.release();  // release/close queryRunner
      }
  } else {  // case#2
      console.log("The following sourceEntry found");
      console.log(JSON.stringify(sourceEntry, null,2 ));
      /* Look for an entry in the target domain where parent_id is equal to src entry id */
      let tgtEntry = await this.promotionService.getTargetEntry(acct_id, toDomainEntity.id, sourceEntry.id);
      /* pull the target contentmd id */
      let tgtContentmdId = tgtEntry.contentmd_id;
      console.log(" the tgtContentmdId is ", tgtContentmdId);
      /* define mod directive to clone and modify the fromContentmd record so it can be saved in 
          target domain using tgt contentmd id and no update_date. The update_date will be updated */
      let modDirective =  { 
        objInstance: fromContentmd,
        addProps: { creator_id: sessionObj.creator_id, domain_id: toDomainEntity.id, id: tgtContentmdId },
        deleteProps: ['domain', 'update_date']
      }
      console.log("THIS IS FROM CONTENTMD")
      console.log(JSON.stringify(fromContentmd,null,2))
      let modifiedContentmd = this.modifyContentmdInstance(modDirective); 
      console.log("THIS IS MODIFIED CONTENTMD")
      console.log(JSON.stringify(modifiedContentmd,null,2))
      
      /* use the target contentmd id to promote the content */
      let contentmdEntity = this.contentmdRepo.create(modifiedContentmd);
      let toContentmd = await queryRunner.manager.save(contentmdEntity);
      console.log("This is image of promoted target contentmd", toContentmd);
    }     

    return fromContentmd;

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
  throwExceptionIfSame(fromDomain, toDomain) {
    if (fromDomain === toDomain) { 
      let errMsg = `Cannot promote content within same '${fromDomain}' domain.`;
      throw new NotAcceptableException(errMsg)
    }
  }
  
  modifyContentmd(fromContentmd: any, 
                       toDomainEntity: Domain,
                       includeId: boolean = false,
                       sessionObj) {
    // clone fromContentmd object and append additional required fields 
    let copyOfFromContentmd: any = {
      ...fromContentmd, 
      creator_id: sessionObj.creator_id,
      domain_id: toDomainEntity.id
    }; 

    // delete fields not required i Contentmd type
    /* note, id property is frozen or configurable is set to false; to delete, make it configurable:true */
    Object.defineProperty(copyOfFromContentmd, 'id', {configurable: true}); 
    !includeId && delete copyOfFromContentmd.id;
    delete copyOfFromContentmd.create_date;
    delete copyOfFromContentmd.update_date;
    
    const clonedContentmd = this.contentmdRepo.create(copyOfFromContentmd);
       
    return clonedContentmd;
  }
  
  // setPrimaryId(classInstance, id ) {
  //   const idLens = R.lensProp('id');
  //   const newClassInstance = R.set(idLens, id, classInstance)
  //   return newClassInstance
  // }

  // setCreatorId(classInstance, creator_id ) {
  //   const creatorLens = R.lensProp('creator_id');
  //   const newClassInstance = R.set(creatorLens, creator_id, classInstance)
  //   return newClassInstance
  // }

  // setDomainId(classInstance, domain_id ) {
  //   const domainLens = R.lensProp('domain_id');
  //   const newClassInstance = R.set(domainLens, domain_id, classInstance)
  //   return newClassInstance
  // }

  // cloneClassInstance(classInstance) {
  //   return {...classInstance}
  // }

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

}
