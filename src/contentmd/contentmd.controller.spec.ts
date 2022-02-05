import { Test, TestingModule } from '@nestjs/testing';
import { ContentmdController } from './contentmd.controller';
import { ContentmdService } from './contentmd.service';

describe('ContentmdController', () => {
  let controller: ContentmdController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContentmdController],
      providers: [ContentmdService],
    }).compile();

    controller = module.get<ContentmdController>(ContentmdController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
