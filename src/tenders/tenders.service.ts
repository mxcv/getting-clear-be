import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { And, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { ProzorroService } from './prozzoro.service';
import { LocalitiesService } from 'src/localities/localities.service';
import { Tender } from './entities/tender.entity';
import { ProcuringEntityKind } from './enum/procuring-entity-kind.enum';
import { SupplierScale } from './enum/supplier-scale.enum';

@Injectable()
export class TendersService {
  constructor(
    @InjectRepository(Tender)
    private readonly tendersRepository: Repository<Tender>,
    private readonly prozorroService: ProzorroService,
    private readonly localitiesService: LocalitiesService,
  ) {}

  async saveByDateRange(from: Date, to: Date) {
    let offset = (from.getTime() / 1000).toString();
    while (true) {
      const tenderIds = await this.prozorroService.getTenderIdsFrom(offset);
      const tenders = [];
      for (const object of tenderIds.data) {
        if (new Date(object.dateModified) > to) {
          offset = '';
          break;
        }
        const tender = await this.parseTender(await this.prozorroService.getTenderById(object.id));
        if (tender) {
          tenders.push(tender);
        }
      }
      await this.tendersRepository.save(tenders);
      if (!offset) {
        break;
      }
      offset = tenderIds.next_page.offset;
    }
  }

  async parseTender(object: any): Promise<Tender> {
    if (object.status !== 'complete' && object.status !== 'active.awarded') {
      return null;
    }
    const tender: Tender = { id: object.id, date: new Date(object.dateModified) };
    tender.kind = Object.values(ProcuringEntityKind).includes(object.procuringEntity.kind)
      ? object.procuringEntity.kind
      : null;
    if (object.procuringEntity.address.locality) {
      tender.locality = await this.localitiesService.getLocality(object.procuringEntity.address.locality);
      if (tender.locality) {
        tender.region = tender.locality.region;
      }
    }
    if (!tender.region && object.procuringEntity.address.region) {
      tender.region = await this.localitiesService.getRegion(object.procuringEntity.address.region);
    }
    const awards = object.awards.filter((a) => a.status === 'active');
    if (awards.every((a) => a.value.currency === 'UAH')) {
      tender.value = awards.reduce((a, b) => a + b.value.amount, 0);
    }
    tender.suppliers = awards
      .flatMap((a) => a.suppliers)
      .filter((s) => s.identifier.scheme === 'UA-EDR')
      .map((s) => ({
        id: s.identifier.id.toUpperCase(),
        scale: Object.values(SupplierScale).includes(s.scale) ? s.scale : null,
      }))
      .filter((s, i, self) => self.findIndex((s1) => s.id === s1.id) === i);
    tender.items = object.items.map((item) => ({
      quantity: item.quantity,
      unit: item.unit ? { id: item.unit.code, name: item.unit.name } : null,
      classification:
        item.classification.scheme === 'ДК021'
          ? {
              id: item.classification.id,
            }
          : null,
    }));
    return tender;
  }

  async getTendersBySupplier(
    supplierId: string,
    before: Date,
  ): Promise<{ count: number; average: number; max: number }> {
    before.setMilliseconds(0);
    const result = await this.tendersRepository
      .createQueryBuilder('tender')
      .select('count(tender.id)', 'count')
      .addSelect('avg(tender.value)', 'average')
      .addSelect('max(tender.value)', 'max')
      .leftJoin('tender.suppliers', 'supplier')
      .where('supplier.id = :supplierId', { supplierId })
      .andWhere('tender.date < :before', { before })
      .andWhere('tender.value is not null')
      .getRawOne();
    return Object.fromEntries(Object.entries(result).map(([k, v]) => [k, +v])) as any;
  }

  async getTenderById(id: string): Promise<Tender> {
    let tender = await this.tendersRepository.findOne({
      where: { id },
      relations: {
        items: {
          classification: true,
          unit: true,
        },
        suppliers: true,
        locality: true,
      },
    });
    if (tender) {
      return tender;
    }
    tender = await this.parseTender(await this.prozorroService.getTenderById(id));
    if (!tender) {
      throw new NotFoundException();
    }
    tender.items = tender.items.map((i) => ({ ...i, classificationId: i.classification.id, unitId: i.unit.id }));
    tender.localityId = tender.locality?.id;
    return tender;
  }

  async getTendersByLocalityId(localityId: number, from: Date, to: Date) {
    return await this.tendersRepository.find({
      where: {
        locality: { id: localityId },
        date: And(MoreThanOrEqual(from), LessThan(to)),
      },
      relations: {
        items: {
          classification: true,
          unit: true,
        },
        suppliers: true,
        locality: true,
      },
    });
  }

  async getTendersByRegionId(regionId: number, from: Date, to: Date) {
    return await this.tendersRepository.find({
      where: {
        region: { id: regionId },
        date: And(MoreThanOrEqual(from), LessThan(to)),
      },
      relations: {
        items: {
          classification: true,
          unit: true,
        },
        suppliers: true,
        locality: true,
      },
    });
  }
}
