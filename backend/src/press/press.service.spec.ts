import { Test, TestingModule } from '@nestjs/testing';
import { PressService } from './press.service';

describe('PressService', () => {
  let service: PressService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PressService],
    }).compile();

    service = module.get<PressService>(PressService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
