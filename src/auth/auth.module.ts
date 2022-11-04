import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { BearerStrategy } from './bearer.strategy';
import { Token } from './token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Token]),
    PassportModule
  ],
  providers: [AuthService, BearerStrategy],
  exports: [AuthService]
})
export class AuthModule {}
