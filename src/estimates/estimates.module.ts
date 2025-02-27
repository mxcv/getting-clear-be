import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EstimatesService } from './estimates.service';
import { EstimatesController } from './estimates.controller';
import { LocalityRangeCostEstimate } from './entities/locality-range-cost-estimate.entity';
import { LocalityCostEstimate } from './entities/locality-cost-estimate.entity';
import { ItemCostEstimate } from './entities/item-cost-estimate.entity';
import { RegionCostEstimate } from './entities/region-cost-estimate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LocalityRangeCostEstimate, LocalityCostEstimate, RegionCostEstimate, ItemCostEstimate]),
  ],
  providers: [EstimatesService],
  controllers: [EstimatesController],
  exports: [EstimatesService],
})
export class EstimatesModule {}
