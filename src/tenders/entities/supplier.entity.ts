import { Column, Entity, ManyToMany, PrimaryColumn } from 'typeorm';
import { Tender } from './tender.entity';
import { SupplierScale } from '../enum/supplier-scale.enum';

@Entity()
export class Supplier {
  @PrimaryColumn()
  id?: string;

  @Column({ type: 'enum', enum: SupplierScale, nullable: true })
  scale?: SupplierScale;

  @ManyToMany(() => Tender)
  tenders?: [];
}
