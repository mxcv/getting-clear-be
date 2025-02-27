import { Module } from '@nestjs/common';
import { ItemsService } from './items.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { ItemClassification } from './entities/item-classification.entity';
import { ItemsController } from './items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Item, ItemClassification])],
  providers: [ItemsService],
  controllers: [ItemsController],
})
export class ItemsModule {}
