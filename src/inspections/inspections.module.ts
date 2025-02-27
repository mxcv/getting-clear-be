import { Module } from '@nestjs/common';
import { InspectionsService } from './inspections.service';
import { InspectionsController } from './inspections.controller';
import { TendersModule } from 'src/tenders/tenders.module';
import { EstimatesModule } from 'src/estimates/estimates.module';
import { LocalitiesModule } from 'src/localities/localities.module';

@Module({
  imports: [TendersModule, EstimatesModule, LocalitiesModule],
  providers: [InspectionsService],
  controllers: [InspectionsController],
})
export class InspectionsModule {}
