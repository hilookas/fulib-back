import { IsDefined } from 'class-validator';

export class ValidatePhoneInput {
  @IsDefined()
  phone: string;

  @IsDefined()
  code: string;
}
