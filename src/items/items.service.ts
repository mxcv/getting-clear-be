import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemClassification } from './entities/item-classification.entity';
import * as classificationList from './data/classifications.ua.json';

@Injectable()
export class ItemsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(ItemClassification)
    private readonly classificationsRepository: Repository<ItemClassification>,
  ) {}

  async onApplicationBootstrap() {
    if (!(await this.classificationsRepository.count())) {
      await this.classificationsRepository.insert(classificationList);
    }
  }

  async getItemClassifications() {
    return await this.classificationsRepository.find();
  }
}
