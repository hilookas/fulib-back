import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as moment from 'moment';
import 'moment/locale/zh-cn';
import { SmsService } from '../sms/sms.service';
import { PhoneValidation } from './phone-validation.entity';
const isChinesePhoneNumber = require('is-chinese-phone-number');

const expiresIn = 5; // minutes

@Injectable()
export class PhoneValidationsService {
  constructor(
    @InjectRepository(PhoneValidation)
    private readonly phoneValidationsRepository: Repository<PhoneValidation>,
    private readonly smsService: SmsService
  ) {}

  filterResult(phoneValidation: PhoneValidation) {
    return Object.assign(new PhoneValidation, {
      phone: phoneValidation.phone,
      remainingChecks: phoneValidation.remainingChecks,
      expiresAt: phoneValidation.expiresAt
    });
  }

  findOne(phone: string) {
    return this.phoneValidationsRepository.findOne({ where: { phone, expiresAt: MoreThan(new Date) } });
  }

  async send(phoneValidation: PhoneValidation) {
    try {
      this.smsService.sendCode(
        phoneValidation.phone,
        phoneValidation.code
      ); // run in background
    } catch (err) {
      console.log(err);
    }
  }

  async create(phone: string) {
    const phoneValidation = new PhoneValidation();
    if (!isChinesePhoneNumber.mobile(phone)) {
      throw new BadRequestException('Wrong phone');
    }
    phoneValidation.phone = phone;
    phoneValidation.code = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    phoneValidation.remainingChecks = 5;
    phoneValidation.expiresAt = moment().add(expiresIn, 'minutes').toDate(); // 5分钟
    return this.phoneValidationsRepository.save(phoneValidation);
  }

  async check(phone: string, code: string) {
    let phoneValidation = await this.findOne(phone);
    if (!phoneValidation) {
      throw new BadRequestException('No running phone validation');
    }
    if (!phoneValidation.remainingChecks) {
      throw new BadRequestException('Too many phone validation checks');
    }
    if (phoneValidation.code !== code) {
      --phoneValidation.remainingChecks; // TODO racing condition
      await this.phoneValidationsRepository.save(phoneValidation)
      throw new BadRequestException('Wrong phone validation code');
    }
    return true;
  }

  async remove(phone: string) {
    await this.phoneValidationsRepository.delete(phone);
    return true;
  }

  async start(phone: string) {
    let phoneValidation = await this.findOne(phone);
    if (!phoneValidation) {
      phoneValidation = await this.create(phone);
      this.send(phoneValidation); // run in background
    } else {
      throw new BadRequestException('Sms has been sent');
    }
    return this.filterResult(phoneValidation);
  }
}
