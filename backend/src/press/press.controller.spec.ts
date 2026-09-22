import { Test, TestingModule } from '@nestjs/testing';
import { PressController } from './press.controller';

describe('PressController', () => {
  let controller: PressController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PressController],
    }).compile();

    controller = module.get<PressController>(PressController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
