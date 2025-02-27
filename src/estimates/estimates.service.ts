import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { LocalityRangeCostEstimate } from './entities/locality-range-cost-estimate.entity';
import { LocalityCostEstimate } from './entities/locality-cost-estimate.entity';
import { RegionCostEstimate } from './entities/region-cost-estimate.entity';
import { ItemCostEstimate } from './entities/item-cost-estimate.entity';
import { Tender } from 'src/tenders/entities/tender.entity';
import { Locality } from 'src/localities/entities/locality.entity';
import { Region } from 'src/localities/entities/region.entity';
import { Item } from 'src/items/entities/item.entity';

@Injectable()
export class EstimatesService {
  constructor(
    @InjectRepository(LocalityRangeCostEstimate)
    private readonly localityRangeCostEstimatesRepository: Repository<LocalityRangeCostEstimate>,
    @InjectRepository(LocalityCostEstimate)
    private readonly localityCostEstimatesRepository: Repository<LocalityCostEstimate>,
    @InjectRepository(RegionCostEstimate)
    private readonly regionCostEstimatesRepository: Repository<RegionCostEstimate>,
    @InjectRepository(ItemCostEstimate)
    private readonly itemCostEstimatesRepository: Repository<ItemCostEstimate>,
    private readonly dataSource: DataSource,
  ) {}

  async getLocalityCostEstimates(year: number, regionId: number): Promise<LocalityCostEstimate[]> {
    return await this.localityCostEstimatesRepository.find({
      where: {
        year,
        locality: {
          region: { id: regionId },
        },
      },
      relations: { locality: true },
    });
  }

  async getLocalityCostEstimate(year: number, localityId: number): Promise<LocalityCostEstimate> {
    return await this.localityCostEstimatesRepository.findOneBy({
      year,
      locality: { id: localityId },
    });
  }

  async getRegionCostEstimates(year: number): Promise<RegionCostEstimate[]> {
    return await this.regionCostEstimatesRepository.find({
      where: { year },
      relations: { region: true },
    });
  }

  async getItemCostEstimate(year: number, classificationId: string, unitId: string): Promise<ItemCostEstimate> {
    return await this.itemCostEstimatesRepository.findOneBy({
      year,
      classification: { id: classificationId },
      unit: { id: unitId },
    });
  }

  async getItemCostEstimateAllUnits(year: number, classificationId: string): Promise<ItemCostEstimate[]> {
    return await this.itemCostEstimatesRepository.find({
      where: {
        year,
        classification: { id: classificationId },
      },
      relations: {
        unit: true,
      },
      order: {
        count: 'DESC',
      },
    });
  }

  async estimateLocalityRangeCosts(year: number, periods: number[], includeFrom: number): Promise<void> {
    periods = [...periods, null];
    const estimates: LocalityRangeCostEstimate[] = [];
    for (let i = 0; i < periods.length - 1; i++) {
      estimates.push({
        year,
        populationFrom: periods[i],
        populationTo: periods[i + 1],
        averageExpenditurePerPerson: await this.getAverageConsumtionPerPerson(
          periods[i],
          periods[i + 1],
          year,
          includeFrom,
        ),
      });
    }
    await this.localityRangeCostEstimatesRepository.delete({ year });
    await this.localityRangeCostEstimatesRepository.insert(estimates);
  }

  async estimateLocalityCosts(year: number): Promise<void> {
    const result = await this.dataSource
      .createQueryBuilder()
      .from(Locality, 'locality')
      .leftJoin(
        (q) => q.from(Tender, 'tender').where('year(tender.date) = :year', { year }),
        'tender',
        'tender.localityId = locality.id',
      )
      .innerJoin(
        LocalityRangeCostEstimate,
        'estimate',
        'estimate.populationFrom <= locality.population and (estimate.populationTo > locality.population or estimate.populationTo is null)',
      )
      .select('locality.id', 'locality_id')
      .addSelect('count(tender.id)', 'tenderCount')
      .addSelect('coalesce(sum(tender.value), 0)', 'realExpenditures')
      .addSelect('max(locality.population) * max(estimate.averageExpenditurePerPerson)', 'expectedExpenditures')
      .addSelect('sum(if(tender.kind = "defense", tender.value, 0))', 'defenseExpenditures')
      .groupBy('locality.id')
      .getRawMany();

    await this.localityCostEstimatesRepository.delete({ year });
    await this.localityCostEstimatesRepository.insert(
      result.map((e) => ({
        year,
        realExpenditures: e.realExpenditures,
        expectedExpenditures: e.expectedExpenditures,
        defenseExpenditures: e.defenseExpenditures,
        tenderCount: e.tenderCount,
        locality: { id: e.locality_id },
      })),
    );
  }

  async estimateRegionCosts(year: number) {
    const result = await this.dataSource
      .createQueryBuilder()
      .from(Region, 'region')
      .leftJoin(
        (q) => q.from(Tender, 'tender').where('year(tender.date) = :year', { year }),
        'tender',
        'tender.regionId = region.id',
      )
      .select('region.id', 'region_id')
      .addSelect('count(tender.id)', 'tenderCount')
      .addSelect('coalesce(sum(tender.value), 0)', 'realExpenditures')
      .addSelect('sum(if(tender.kind = "defense", tender.value, 0))', 'defenseExpenditures')
      .groupBy('region.id')
      .getRawMany();

    await this.regionCostEstimatesRepository.delete({ year });
    await this.regionCostEstimatesRepository.insert(
      result.map((e) => ({
        year,
        realExpenditures: e.realExpenditures,
        defenseExpenditures: e.defenseExpenditures,
        tenderCount: e.tenderCount,
        region: { id: e.region_id },
      })),
    );
  }

  async estimateItemCosts(year: number): Promise<void> {
    const result = await this.dataSource
      .createQueryBuilder()
      .select('classification')
      .addSelect('unit')
      .addSelect('count(classification)', 'count')
      .addSelect('exp(avg(log(price)))', 'averagePrice')
      .from(
        (query) =>
          query
            .from(Item, 'item')
            .innerJoinAndSelect('item.tender', 'tender')
            .select('max(item.classificationId)', 'classification')
            .addSelect('max(tender.value) / max(item.quantity)', 'price')
            .addSelect('max(item.unitId)', 'unit')
            .where('year(tender.date) = :year', { year })
            .andWhere('tender.value is not null')
            .andWhere('tender.value != 0')
            .andWhere('item.quantity is not null')
            .andWhere('item.quantity != 0')
            .andWhere('item.classificationId is not null')
            .andWhere('item.unitId is not null')
            .groupBy('tender.id')
            .having('count(tender.id) = 1'),
        'item',
      )
      .groupBy('classification')
      .addGroupBy('unit')
      .getRawMany();

    await this.itemCostEstimatesRepository.delete({ year });
    await this.itemCostEstimatesRepository.insert(
      result.map((e) => ({
        year,
        averagePrice: e.averagePrice,
        count: e.count,
        classification: { id: e.classification },
        unit: { id: e.unit },
      })),
    );
  }

  async getAverageConsumtionPerPerson(
    populationFrom: number | null,
    populationTo: number | null,
    year: number,
    includeFrom: number,
  ): Promise<number> {
    const query = this.dataSource
      .createQueryBuilder()
      .from(Tender, 'tender')
      .leftJoinAndSelect('tender.locality', 'locality')
      .select('sum(value) / locality.population', 'sum')
      .where('year(tender.date) = :year', { year })
      .groupBy('locality.id')
      .having('sum > :includeFrom', { includeFrom });
    if (populationFrom) {
      query.andWhere('locality.population >= :populationFrom', { populationFrom });
    }
    if (populationTo) {
      query.andWhere('locality.population < :populationTo', { populationTo });
    }
    const result = await query.getRawMany();
    return result.map((a) => +a.sum).reduce((a, b) => a + b, 0) / result.length;
  }
}
