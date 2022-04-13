import { Injectable } from '@nestjs/common';
import { Repository, getRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { Promotion } from './entities/promotion.entity';

@Injectable()
export class PromotionService {
  
  constructor(@InjectRepository(Promotion) private promotionRepo: Repository<Promotion>) {}

  create(createPromotionDto: CreatePromotionDto) {
    // /* create instance of Domain */
    // const newPromtionEntry = this.promotionRepo.create(createPromotionDto);
    // /* save to repository */
    // return this.promotionRepo.save(newPromtionEntry);
    return `This action creates a promtion entry`;
  }

  findAll() {
    return `This action returns all promotion`;
  }

  findOne(id: number) {
    return `This action returns a #${id} promotion`;
  }

  update(id: number, updatePromotionDto: UpdatePromotionDto) {
    return `This action updates a #${id} promotion`;
  }

  remove(id: number) {
    return `This action removes a #${id} promotion`;
  }

  //* ***********************************************************
  //* Helper functions
  //* ***********************************************************
  /* If source in promotion table, then its been promoted */
  getEntryByContentmdId(acct_id, domain_id, contentmd_id) {
    // const [domain] = await 
    return this.promotionRepo.findOne({
      where: {
        acct_id,
        domain_id, 
        contentmd_id
      }
    });  
  }

  // // Looks for an entry in the target domain where parent_id is equal to src entry id
  // getEntryByParentId(acct_id, domain_id, parent_id) {
  //   return this.promotionRepo.findOne({
  //     where: { 
  //       acct_id, 
  //       domain_id, 
  //       parent_id  
  //     } 
  //   });  
  // }

  // Looks for an entry in the target domain where parent_id is equal to src entry id.
  // This effectively will determine if the src entry has a child (aka promotion relation) in 
  // the target domain.
  getEntryByParentId(acct_id, domain_id, parent_id) {
    type searchObj = { acct_id: number, domain_id?: number, parent_id: number };
    let whereObj: searchObj = { 
      acct_id, 
      domain_id, 
      parent_id  
    };
    return this.promotionRepo.findOne({
      where: whereObj 
    });  
  }
  
  
  // saves entry in promotion table
  saveEntry(acct_id, contentmd, parent_contentmd_id, parent_id) {
    console.log(">>> Inside saveEntry");
    // console.log(`   contentmd ${JSON.stringify(contentmd)}`);
    let { id: domain_id } = contentmd.domain;
    let { id: contentmd_id } = contentmd;
    console.log(`   contentmd ${JSON.stringify(domain_id)}`);
    console.log(`   contentmd ${JSON.stringify(contentmd_id)}`);
    const createPromotionDto: CreatePromotionDto = {
      acct_id,
      domain_id,
      contentmd_id,
      parent_contentmd_id,
      parent_id 
    }
    return this.promotionRepo.save(createPromotionDto);
  }

  async isReversePromotion(acct_id, srcDomainId, srcContentmdId, tgtDomainId) {
    console.log(">>> Inside isReversePromotion"); 

    /* Lookup by contendmd_id and obtain parent_id from source entry */
    const srcEntry = await this.getEntryByContentmdId(acct_id, srcDomainId, srcContentmdId);
    if (!srcEntry) {return false;}  /* if did not find src entry, just return false */
    const srcParentId = srcEntry.parent_id;

    /* check that parent_id does not appear as contentmd_id in target domain  */
    const tgtEntry = await this.getEntryByContentmdId(acct_id, tgtDomainId, srcParentId);

    /* if exists return true, else false  */
    return tgtEntry ? true : false;
  }

  /**
   * Pass in a Promotion Entity and get the child ids. Check 
   * where entries have the promotionEntity as a parent; that means their parent
   * id is equal to promotionEntity.id. Note that domain_id is not provided because
   * we are looking for child entries in any domain.
   * @param acct_id
   * @param promotionEntity 
   */
  async getChildEntryIds(acct_id, promotionEntity) {
    const id = promotionEntity.id
    const ids = this.getEntryByParentId(acct_id, null, id)
  }
  

}
