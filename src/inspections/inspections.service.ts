import { Injectable } from '@nestjs/common';
import { EstimatesService } from 'src/estimates/estimates.service';
import { Tender } from 'src/tenders/entities/tender.entity';
import { TendersService } from 'src/tenders/tenders.service';
import { LocalitiesService } from 'src/localities/localities.service';
import { ProcuringEntityKind } from 'src/tenders/enum/procuring-entity-kind.enum';
import { CourruptionProbabilityRule } from './corruption-probabilities/rule';
import {
  InspectionCorruptionProbability,
  InspectionDetails,
  InspectionResult,
  InspectionSupplierTenders,
} from './dto/inspection-result.dto';
import * as itemCP from './corruption-probabilities/items.json';
import * as supplierCP from './corruption-probabilities/suppliers.json';
import * as localityCP from './corruption-probabilities/localities.json';

@Injectable()
export class InspectionsService {
  constructor(
    private readonly tendersService: TendersService,
    private readonly estimateSrvice: EstimatesService,
    private readonly localityService: LocalitiesService,
  ) {}

  async inspectLocality(localityId: number, from: Date, to: Date) {
    const tenders = await this.tendersService.getTendersByLocalityId(localityId, from, to);
    return await this.inspectTenders(tenders);
  }

  async inspectRegion(regionId: number, from: Date, to: Date) {
    const tenders = await this.tendersService.getTendersByRegionId(regionId, from, to);
    return await this.inspectTenders(tenders);
  }

  async inspectRegions(from: Date, to: Date) {
    const regions = await this.localityService.getRegions();
    const result = [];
    const distribution = [];
    for (let i = 0; i <= 100; i++) {
      distribution.push({
        rate: i,
        itemsCount: 0,
        localityCount: 0,
        suppliersCount: 0,
        totalCount: 0,
      });
    }
    for (const region of regions) {
      const tenders = await this.tendersService.getTendersByRegionId(region.id, from, to);
      result.push({
        region,
        result: await this.inspectTenders(tenders, distribution),
      });
    }
    return { distribution, result };
  }

  async inspectTenders(tenders: Tender[], distribution: any[] = undefined) {
    const result = [];
    for (const tender of tenders) {
      const details = await this.createInspectionDetails(tender);
      result.push({ id: tender.id, ...(await this.createInspectionCorruptionProbability(tender, details)) });
    }
    result.sort((a, b) => b.total - a.total);
    if (distribution) {
      for (const t of result) {
        distribution.find((d) => d.rate === t.items).itemsCount++;
        distribution.find((d) => d.rate === t.locality).localityCount++;
        distribution.find((d) => d.rate === t.suppliers).suppliersCount++;
        distribution.find((d) => d.rate === t.total).totalCount++;
      }
    }
    return {
      count: result.length,
      averageItems: result.reduce((a, b) => a + b.items, 0) / result.length || 0,
      averageLocalitiy: result.reduce((a, b) => a + b.locality, 0) / result.length || 0,
      averageSuppliers: result.reduce((a, b) => a + b.suppliers, 0) / result.length || 0,
      averageTotal: result.reduce((a, b) => a + b.total, 0) / result.length || 0,
      moreThan50Count: result.filter((t) => t.total >= 50).length,
      data: result,
    };
  }

  async inspectTender(tenderId: string);
  async inspectTender(tender: Tender);
  async inspectTender(tender: string | Tender): Promise<InspectionResult> {
    if (typeof tender === 'string') {
      tender = await this.tendersService.getTenderById(tender);
    }
    const details = await this.createInspectionDetails(tender);
    const corruptionProbability = await this.createInspectionCorruptionProbability(tender, details);
    return { details, corruptionProbability };
  }

  private async createInspectionDetails(tender: Tender): Promise<InspectionDetails> {
    const year = 2024;
    const expectedItemIdPricesPerOne: { [itemId: string]: number | null } = Object.fromEntries(
      await Promise.all(
        tender.items.map(async (i) => [
          i.id,
          (await this.estimateSrvice.getItemCostEstimate(year, i.classificationId, i.unitId))?.averagePrice,
        ]),
      ),
    );
    const expectedTotalPrice = tender.items
      .map((i) => i.quantity * expectedItemIdPricesPerOne[i.id])
      .reduce((p, c) => p + c, 0);
    const expectedItemPricesPerOne = tender.items.map((i) => ({
      classification: i.classification?.description,
      unit: i.unit?.name,
      quantity: i.quantity,
      price: expectedItemIdPricesPerOne[i.id],
    }));
    const isDefence = tender.kind === ProcuringEntityKind.DEFENSE;
    let realExpectedPriceRatio, localityYearEstimateRatio, realTotalPrice;
    if (tender.value) {
      realTotalPrice = +tender.value;
      realExpectedPriceRatio = tender.value / expectedTotalPrice;
      if (tender.localityId) {
        const estimate = await this.estimateSrvice.getLocalityCostEstimate(year, tender.localityId);
        if (estimate) {
          localityYearEstimateRatio = tender.value / estimate.expectedExpenditures;
        }
      }
    } else {
      realExpectedPriceRatio = localityYearEstimateRatio = null;
    }
    const previosSupplierTenderPrices: { [supplierId: string]: InspectionSupplierTenders } = Object.fromEntries(
      await Promise.all(
        tender.suppliers.map(async (s) => {
          return [s.id, await this.tendersService.getTendersBySupplier(s.id, tender.date)];
        }),
      ),
    );
    return {
      expectedItemPricesPerOne,
      expectedTotalPrice,
      realTotalPrice,
      realExpectedPriceRatio,
      locality: tender.locality?.name,
      localityYearEstimateRatio,
      isDefence,
      previosSupplierTenderPrices,
    };
  }

  private async createInspectionCorruptionProbability(
    tender: Tender,
    details: InspectionDetails,
  ): Promise<InspectionCorruptionProbability> {
    const currentSupplierLevel = this.getCorruptionProbability(tender.value, supplierCP);
    const previosMaxLevel = Math.max(
      ...Object.entries(details.previosSupplierTenderPrices).map((s) =>
        this.getCorruptionProbability(s[1].max, supplierCP),
      ),
      0,
    );
    const cp = {
      items: details.realExpectedPriceRatio ? this.getCorruptionProbability(details.realExpectedPriceRatio, itemCP) : 0,
      locality: details.localityYearEstimateRatio
        ? this.getCorruptionProbability(details.localityYearEstimateRatio, localityCP)
        : 0,
      suppliers: currentSupplierLevel - previosMaxLevel > 0 ? currentSupplierLevel - previosMaxLevel : 0,
    };
    return { ...cp, total: cp.items + cp.locality + cp.suppliers < 100 ? cp.items + cp.locality + cp.suppliers : 100 };
  }

  private getCorruptionProbability(value: number, rules: CourruptionProbabilityRule[]): number {
    let sum = 0;
    for (const rule of rules) {
      if (value < rule.from) {
        break;
      }
      if (value <= rule.to) {
        sum += Math.trunc((value - rule.from) / rule.step + 100 * Number.EPSILON);
        break;
      }
      sum += (rule.to - rule.from) / rule.step;
    }
    return sum;
  }
}
