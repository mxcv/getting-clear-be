import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Region } from './region.entity';
import { Tender } from 'src/tenders/entities/tender.entity';

@Entity()
export class Locality {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name?: string;

  @Column()
  population?: number;

  @ManyToOne(() => Region, { nullable: false, createForeignKeyConstraints: false })
  region?: Region;

  @OneToMany(() => Tender, (tender) => tender.locality)
  tenders?: Tender[];
}
