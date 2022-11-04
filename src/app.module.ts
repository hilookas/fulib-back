import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'sqlite',
        database: configService.get<string>('DATABASE')
          ? configService.get<string>('DATABASE')
          : join(process.cwd(), 'database.sqlite'),
        autoLoadEntities: true,
        synchronize: configService.get<string>('DATABASE') ? undefined : true,
      })
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
