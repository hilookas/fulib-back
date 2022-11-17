import { Controller, Post, Body } from '@nestjs/common';
import { PhoneValidationsService } from './phone-validations.service';

@Controller('phone-validations')
export class PhoneValidationsController {
  constructor(private readonly phoneValidationsService: PhoneValidationsService) {}

  @Post()
  startPhoneValidation(@Body('phone') phone: string) {
    return this.phoneValidationsService.start(phone);
  }
}
