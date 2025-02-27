import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';
import { Item } from './item.entity';

@Entity()
export class ItemClassification {
  @PrimaryColumn()
  id?: string;

  @Column()
  description?: string;

  @OneToMany(() => Item, (item) => item.classification)
  items?: Item[];
}
