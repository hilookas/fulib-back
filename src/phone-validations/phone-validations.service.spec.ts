import { Test, TestingModule } from '@nestjs/testing';
import { PhoneValidationsService } from './phone-validations.service';

describe('PhoneValidationsService', () => {
  let service: PhoneValidationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PhoneValidationsService],
    }).compile();

    service = module.get<PhoneValidationsService>(PhoneValidationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
