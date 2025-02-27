import { Body, Controller, Get, Put, Query } from '@nestjs/common';
import { EstimatesService } from './estimates.service';
import { LocalityCostEstimateCreate } from './dto/locality-cost-estimate-create.dto';
import { ItemCostEstimate } from './entities/item-cost-estimate.entity';

@Controller('estimates')
export class EstimatesController {
  constructor(private readonly estimatesService: EstimatesService) {}

  @Get('localities')
  async getLocalities(@Query('year') year: number, @Query('regionId') regionId: number) {
    return await this.estimatesService.getLocalityCostEstimates(year, regionId);
  }

  @Put('localities')
  async putLocalities(@Body() dto: LocalityCostEstimateCreate) {
    await this.estimatesService.estimateLocalityRangeCosts(dto.year, dto.periods, dto.includeFrom);
    await this.estimatesService.estimateLocalityCosts(dto.year);
  }

  @Get('regions')
  async getRegions(@Query('year') year: number) {
    return await this.estimatesService.getRegionCostEstimates(year);
  }

  @Put('regions')
  async putRegions(@Query('year') year: number) {
    await this.estimatesService.estimateRegionCosts(year);
  }

  @Get('items')
  async getItems(@Query('year') year: number, @Query('classificationId') classificationId: string) {
    return await this.estimatesService.getItemCostEstimateAllUnits(year, classificationId);
  }

  @Put('items')
  async putItems(@Body() dto: ItemCostEstimate) {
    await this.estimatesService.estimateItemCosts(dto.year);
  }
}
