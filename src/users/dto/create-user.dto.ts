import { IsDefined } from 'class-validator';

export class CreateUserDto {
  @IsDefined()
  name: string;

  @IsDefined()
  phone: string;

  @IsDefined()
  address: string;
}
