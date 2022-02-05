import { Test, TestingModule } from '@nestjs/testing';
import { ContentmdService } from './contentmd.service';

describe('ContentmdService', () => {
  let service: ContentmdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentmdService],
    }).compile();

    service = module.get<ContentmdService>(ContentmdService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
