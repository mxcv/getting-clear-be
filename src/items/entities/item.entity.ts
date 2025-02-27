import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, RelationId } from 'typeorm';
import { ItemClassification } from './item-classification.entity';
import { Tender } from 'src/tenders/entities/tender.entity';
import { ItemUnit } from './item-unit.entity';

@Entity()
export class Item {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ type: 'float', nullable: true })
  quantity?: number;

  @ManyToOne(() => ItemUnit, { cascade: true })
  unit?: ItemUnit;

  @ManyToOne(() => ItemClassification)
  classification?: ItemClassification;

  @ManyToOne(() => Tender, { orphanedRowAction: 'delete', onDelete: 'CASCADE' })
  tender?: Tender;

  @RelationId((item: Item) => item.unit)
  unitId?: string;

  @RelationId((item: Item) => item.classification)
  classificationId?: string;
}
