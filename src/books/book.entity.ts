import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  isbn: string;

  @Column()
  name: string;

  @Column()
  author: string;

  @Column()
  description: string;

  @Column()
  canBuy: boolean;

  @Column({ nullable: true })
  sellPrice: number;

  @Column()
  canBorrow: boolean;

  @ManyToOne(() => User, { nullable: true })
  borrowedByUser: User;

  @ManyToOne(() => User)
  user: User;

  @Column()
  updatedAt: Date;
}
