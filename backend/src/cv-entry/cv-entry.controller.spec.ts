import { Test, TestingModule } from '@nestjs/testing';
import { CvEntryController } from './cv-entry.controller';

describe('CvEntryController', () => {
  let controller: CvEntryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CvEntryController],
    }).compile();

    controller = module.get<CvEntryController>(CvEntryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
