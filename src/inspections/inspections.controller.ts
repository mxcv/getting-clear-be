import { Controller, Get, Param, Query } from '@nestjs/common';
import { InspectionsService } from './inspections.service';

@Controller('inspections')
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Get('tenders/:id')
  async tenders(@Param('id') id: string) {
    return await this.inspectionsService.inspectTender(id);
  }

  @Get('regions/:id')
  async regionsById(@Param('id') regionId: number, @Query('from') from: string, @Query('to') to: string) {
    return await this.inspectionsService.inspectRegion(regionId, new Date(from), new Date(to));
  }

  @Get('regions')
  async regions(@Query('from') from: string, @Query('to') to: string) {
    return await this.inspectionsService.inspectRegions(new Date(from), new Date(to));
  }

  @Get('localities/:id')
  async localities(@Param('id') localityId: number, @Query('from') from: string, @Query('to') to: string) {
    return await this.inspectionsService.inspectLocality(localityId, new Date(from), new Date(to));
  }
}
