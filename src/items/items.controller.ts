import { Controller, Get } from '@nestjs/common';
import { ItemsService } from './items.service';

@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get('classifications')
  async classifications() {
    return await this.itemsService.getItemClassifications();
  }
}
