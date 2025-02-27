import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { LocalitiesModule } from 'src/localities/localities.module';
import { ProzorroService } from './prozzoro.service';
import { TendersService } from './tenders.service';
import { TendersController } from './tenders.controller';
import { Tender } from './entities/tender.entity';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        baseURL: configService.get('PROZORRO_URL'),
      }),
    }),
    TypeOrmModule.forFeature([Tender]),
    LocalitiesModule,
  ],
  providers: [TendersService, ProzorroService],
  controllers: [TendersController],
  exports: [TendersService],
})
export class TendersModule {}
