import { Test, TestingModule } from '@nestjs/testing';
import { PhoneValidationsController } from './phone-validations.controller';
import { PhoneValidationsService } from './phone-validations.service';

describe('PhoneValidationsController', () => {
  let controller: PhoneValidationsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneValidationsController, PhoneValidationsService],
    }).compile();

    controller = module.get<PhoneValidationsController>(PhoneValidationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
