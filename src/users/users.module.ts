import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { AuthModule } from '../auth/auth.module';
import { PhoneValidationsModule } from '../phone-validations/phone-validations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    AuthModule,
    PhoneValidationsModule
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService]
})
export class UsersModule {}
