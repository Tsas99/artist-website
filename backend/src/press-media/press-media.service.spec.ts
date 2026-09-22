import { Test, TestingModule } from '@nestjs/testing';
import { PressMediaService } from './press-media.service';

describe('PressMediaService', () => {
  let service: PressMediaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PressMediaService],
    }).compile();

    service = module.get<PressMediaService>(PressMediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
