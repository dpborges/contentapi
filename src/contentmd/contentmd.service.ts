import { Contentmd } from './entities/contentmd.entity';
import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { CreateContentmdDto } from './dto/create-contentmd.dto';
import { UpdateContentmdDto } from './dto/update-contentmd.dto';

@Injectable()
export class ContentmdService {

  constructor(@InjectRepository(Domain) private domainRepo: Repository<Contentmd>) {}

  create(createContentmdDto: CreateContentmdDto) {
    return 'This action adds a new contentmd';
  }

  findAll() {
    return `This action returns all contentmd`;
  }

  findOne(id: number) {
    return `This action returns a #${id} contentmd`;
  }

  update(id: number, updateContentmdDto: UpdateContentmdDto) {
    return `This action updates a #${id} contentmd`;
  }

  remove(id: number) {
    return `This action removes a #${id} contentmd`;
  }
}
