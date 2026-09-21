import { Test, TestingModule } from '@nestjs/testing';
import { CvEntryService } from './cv-entry.service';

describe('CvEntryService', () => {
  let service: CvEntryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CvEntryService],
    }).compile();

    service = module.get<CvEntryService>(CvEntryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
