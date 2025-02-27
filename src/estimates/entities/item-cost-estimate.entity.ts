import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ItemClassification } from 'src/items/entities/item-classification.entity';
import { ItemUnit } from 'src/items/entities/item-unit.entity';

@Entity()
export class ItemCostEstimate {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  year?: number;

  @Column({ type: 'float' })
  averagePrice?: number;

  @Column()
  count?: number;

  @ManyToOne(() => ItemClassification, { nullable: false })
  classification?: ItemClassification;

  @ManyToOne(() => ItemUnit, { nullable: false })
  unit?: ItemUnit;
}
