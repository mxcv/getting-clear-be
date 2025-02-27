import { Controller, Get, Param } from '@nestjs/common';
import { LocalitiesService } from './localities.service';

@Controller('regions')
export class LocalitiesController {
  constructor(private readonly localitiesService: LocalitiesService) {}

  @Get()
  async regions() {
    return await this.localitiesService.getRegions();
  }

  @Get(':regionId/localities')
  async localities(@Param('regionId') regionId: number) {
    return await this.localitiesService.getLocalities(regionId);
  }
}
