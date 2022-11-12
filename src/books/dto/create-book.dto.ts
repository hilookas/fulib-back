import { IsDefined, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateBookDto {
  @IsDefined()
  isbn: string;

  @IsDefined()
  name: string;

  @IsDefined()
  author: string;

  @IsDefined()
  description: string;

  @IsDefined()
  @IsBoolean()
  canBuy: boolean;

  @IsOptional()
  @IsInt()
  sellPrice?: number;

  @IsDefined()
  @IsBoolean()
  canBorrow: boolean;
}
