import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class PhoneValidation {
  @PrimaryColumn()
  phone: string;

  @Column()
  code?: string;

  @Column()
  remainingChecks?: number;

  @Column()
  expiresAt: Date;
}
