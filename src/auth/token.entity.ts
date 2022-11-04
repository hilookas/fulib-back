import { Entity, Column, PrimaryColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity'

@Entity()
export class Token {
  @PrimaryColumn()
  id: string;

  @ManyToOne(() => User)
  user: User;

  @Column()
  issuedAt: Date;
}
