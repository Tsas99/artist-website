import { Test, TestingModule } from '@nestjs/testing';
import { PressMediaController } from './press-media.controller';

describe('PressMediaController', () => {
  let controller: PressMediaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PressMediaController],
    }).compile();

    controller = module.get<PressMediaController>(PressMediaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
