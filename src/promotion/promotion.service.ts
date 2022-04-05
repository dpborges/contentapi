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
  getSourceEntry(acct_id, src_domain_id, src_contentmd_id) {
    // const [domain] = await 
    return this.promotionRepo.findOne({
      where: {
        acct_id,
        domain_id: src_domain_id, 
        contentmd_id: src_contentmd_id
      }
    });  
  }

  // Looks for an entry in the target domain where parent_id is equal to src entry id
  getTargetEntry(acct_id, tgt_domain_id, parent_id) {
    return this.promotionRepo.findOne({
      where: {
        acct_id,
        domain_id: tgt_domain_id, 
        parent_id
      }
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



}
