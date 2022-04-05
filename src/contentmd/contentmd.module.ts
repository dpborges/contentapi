import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';  
import { ContentmdService } from './contentmd.service';
import { PromotionModule } from '../promotion/promotion.module';
import { ContentmdController } from './contentmd.controller';
import { Contentmd } from './entities/contentmd.entity';
// import { DomainModule } from '../domain/domain.module';
import { DomainService } from '../domain/domain.service';
import { Domain } from '../domain/entities/domain.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Contentmd,Domain]), 
            PromotionModule],
  controllers: [ContentmdController],
  providers: [ContentmdService, DomainService]
})
export class ContentmdModule {}
