import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
const isChinesePhoneNumber = require('is-chinese-phone-number');

@Injectable()
export class SmsService {
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async sendCode(to: string, code: string) {
    if (!isChinesePhoneNumber.mobile(to)) {
      throw new Error('Wrong phone');
    }
    return this.httpService.axiosRef.post('https://api-v4.mysubmail.com/sms/xsend', {
      to,
      project: this.configService.get<string>('SUBMAIL_SMS_TMPLID'),
      vars: JSON.stringify({
        code
      }),
      appid: this.configService.get<string>('SUBMAIL_SMS_APIID'),
      signature: this.configService.get<string>('SUBMAIL_SMS_APIKEY'),
    });
  }
}