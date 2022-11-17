import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmsModule } from '../sms/sms.module';
import { PhoneValidation } from './phone-validation.entity';
import { PhoneValidationsService } from './phone-validations.service';
import { PhoneValidationsController } from './phone-validations.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([PhoneValidation]),
    SmsModule
  ],
  controllers: [PhoneValidationsController],
  providers: [PhoneValidationsService],
  exports: [PhoneValidationsService]
})
export class PhoneValidationsModule {}
