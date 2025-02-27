import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class ItemUnit {
  @PrimaryColumn()
  id?: string;

  @Column({ nullable: false })
  name?: string;

  @OneToMany(() => Item, (item) => item.unit)
  items?: Item[];
}
