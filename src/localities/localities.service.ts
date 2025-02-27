import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { Locality } from './entities/locality.entity';
import { Region } from './entities/region.entity';
import * as localityList from './data/localities.json';

@Injectable()
export class LocalitiesService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Locality)
    private readonly localitiesRepository: Repository<Locality>,
    @InjectRepository(Region)
    private readonly regionsRepository: Repository<Region>,
  ) {}

  async onApplicationBootstrap() {
    if (!(await this.localitiesRepository.count())) {
      const regions: Region[] = [...new Set(localityList.map((c) => c.region))]
        .sort((a, b) => a.localeCompare(b))
        .map((r) => ({ name: r }));
      await this.regionsRepository.insert(regions);

      const localities: Locality[] = localityList.map((c) => ({
        name: c.locality,
        population: c.population,
        region: regions.find((r) => r.name === c.region),
      }));
      await this.localitiesRepository.insert(localities);
    }
  }

  async getLocality(name: string): Promise<Locality> {
    return await this.localitiesRepository
      .createQueryBuilder('locality')
      .leftJoinAndSelect('locality.region', 'region')
      .andWhere(':name like concat("%", locality.name)', { name })
      .getOne();
  }

  async getRegion(name: string) {
    if (name.startsWith('м. ')) {
      name = name.substring(3);
    }
    return await this.regionsRepository.findOneBy({ name });
  }

  async getLocalities(regionId: number) {
    return await this.localitiesRepository.findBy({ region: { id: regionId } });
  }

  async getRegions() {
    return await this.regionsRepository.find();
  }
}
