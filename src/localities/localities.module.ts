import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalitiesService } from './localities.service';
import { LocalitiesController } from './localities.controller';
import { Locality } from './entities/locality.entity';
import { Region } from './entities/region.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Locality, Region])],
  providers: [LocalitiesService],
  exports: [LocalitiesService],
  controllers: [LocalitiesController],
})
export class LocalitiesModule {}
