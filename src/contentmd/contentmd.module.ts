import { Module } from '@nestjs/common';
import { ContentmdService } from './contentmd.service';
import { ContentmdController } from './contentmd.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Contendmd])],
  controllers: [ContentmdController],
  providers: [ContentmdService]
})
export class ContentmdModule {}
