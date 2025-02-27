import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TendersModule } from './tenders/tenders.module';
import { LocalitiesModule } from './localities/localities.module';
import { ItemsModule } from './items/items.module';
import { EstimatesModule } from './estimates/estimates.module';
import { InspectionsModule } from './inspections/inspections.module';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DATA_SOURCE_HOST'),
        port: configService.get('DATA_SOURCE_PORT'),
        username: configService.get('DATA_SOURCE_USERNAME'),
        password: configService.get('DATA_SOURCE_PASSWORD'),
        database: configService.get('DATA_SOURCE_DATABASE'),
        synchronize: configService.get('DATA_SOURCE_SYNCHRONIZE') === 'true',
        entities: [join(__dirname, '**/*.entity.js')],
        timezone: 'Z',
      }),
    }),
    TendersModule,
    LocalitiesModule,
    ItemsModule,
    EstimatesModule,
    InspectionsModule,
  ],
})
export class AppModule {}
