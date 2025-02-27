import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { TendersService } from './tenders.service';
import { ProzorroService } from './prozzoro.service';
import { DateRangeDto } from './dto/date-range.dto';

@Controller('tenders')
export class TendersController {
  constructor(
    private readonly tendersService: TendersService,
    private readonly prozorroService: ProzorroService,
  ) {}

  @Put('seed')
  async post(@Body() dateRange: DateRangeDto) {
    await this.tendersService.saveByDateRange(dateRange.from, dateRange.to);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.prozorroService.getTenderById(id);
  }
}
