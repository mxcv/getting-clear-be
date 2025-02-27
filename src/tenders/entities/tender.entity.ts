import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryColumn, RelationId } from 'typeorm';
import { Locality } from 'src/localities/entities/locality.entity';
import { Region } from 'src/localities/entities/region.entity';
import { Item } from 'src/items/entities/item.entity';
import { ProcuringEntityKind } from '../enum/procuring-entity-kind.enum';
import { Supplier } from './supplier.entity';

@Entity()
export class Tender {
  @PrimaryColumn()
  id?: string;

  @Column()
  date?: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  value?: number;

  @Column({ type: 'enum', enum: ProcuringEntityKind, nullable: true })
  kind?: string;

  @ManyToOne(() => Locality)
  locality?: Locality;

  @ManyToOne(() => Region)
  region?: Region;

  @OneToMany(() => Item, (item) => item.tender, { cascade: true })
  items?: Item[];

  @ManyToMany(() => Supplier, { cascade: true })
  @JoinTable()
  suppliers?: Supplier[];

  @RelationId((tender: Tender) => tender.locality)
  localityId?: number;
}
