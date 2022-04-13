import { Test, TestingModule } from '@nestjs/testing';
import { ContentmdService } from './contentmd.service';
import { awsS3IdBuild, awsS3IdSplit } from './utils';

describe('ContentmdService', () => {
  let service: ContentmdService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentmdService],
    }).compile();

    service = module.get<ContentmdService>(ContentmdService);
  });

  it('dummy service', () => {
    let expectedValue = 0;
    expect(0).toBeDefined(expectedValue);
  });

});
